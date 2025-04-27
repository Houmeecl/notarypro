import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Laptop, Smartphone, Download, FileCode, Info, ExternalLink, Copy, Check } from "lucide-react";

interface SDKForm {
  nombreTienda: string;
  direccion: string;
  region: string;
  comuna: string;
  id: string;
  apiKey: string;
}

interface ClienteForm {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
}

interface DocumentoForm {
  tipo: string;
  titulo: string;
  detalle: string;
  monto: string;
  metodoPago: string;
}

const AndroidSdkTest: React.FC = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("simulador");
  const [formData, setFormData] = useState<SDKForm>({
    nombreTienda: "Mi Tienda Vecinos",
    direccion: "Avenida Providencia 1234",
    region: "Región Metropolitana",
    comuna: "Providencia",
    id: "12345",
    apiKey: "vns_test_key_123456789",
  });

  const [clienteForm, setClienteForm] = useState<ClienteForm>({
    nombre: "Juan Pérez González",
    rut: "12.345.678-9",
    email: "juan.perez@ejemplo.cl",
    telefono: "+56912345678",
  });

  const [documentoForm, setDocumentoForm] = useState<DocumentoForm>({
    tipo: "poder",
    titulo: "Poder Simple para Trámite",
    detalle: "Autorización para realizar trámite en registro civil",
    monto: "15000",
    metodoPago: "efectivo",
  });

  const [clienteRegistrado, setClienteRegistrado] = useState(false);
  const [documentoProcesado, setDocumentoProcesado] = useState(false);
  const [reciboGenerado, setReciboGenerado] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClienteForm({ ...clienteForm, [name]: value });
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDocumentoForm({ ...documentoForm, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setDocumentoForm({ ...documentoForm, [name]: value });
  };

  const handleRegistrarCliente = () => {
    // Validaciones básicas
    if (!clienteForm.nombre || !clienteForm.rut || !clienteForm.email) {
      toast({
        title: "Error en el formulario",
        description: "Nombre, RUT y email son campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setClienteRegistrado(true);
    toast({
      title: "Cliente registrado correctamente",
      description: `${clienteForm.nombre} ha sido registrado en el sistema`,
    });
  };

  const handleProcesarDocumento = () => {
    // Validar cliente registrado
    if (!clienteRegistrado) {
      toast({
        title: "Paso incompleto",
        description: "Primero debe registrar al cliente (Paso 1)",
        variant: "destructive",
      });
      return;
    }

    // Validar campos documento
    if (!documentoForm.titulo || !documentoForm.monto) {
      toast({
        title: "Error en el formulario",
        description: "Título y monto son campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setDocumentoProcesado(true);
    toast({
      title: "Documento procesado correctamente",
      description: `${documentoForm.titulo} ha sido registrado para ${clienteForm.nombre}`,
    });
  };

  const handleGenerarRecibo = () => {
    // Validar documento procesado
    if (!documentoProcesado) {
      toast({
        title: "Paso incompleto",
        description: "Primero debe procesar el documento (Paso 2)",
        variant: "destructive",
      });
      return;
    }

    // Generar código aleatorio para verificación
    const codigo = `VEC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    setCodigoVerificacion(codigo);
    setReciboGenerado(true);
    
    toast({
      title: "Recibo generado correctamente",
      description: `Código de verificación: ${codigo}`,
    });
  };

  const handleReiniciar = () => {
    setClienteRegistrado(false);
    setDocumentoProcesado(false);
    setReciboGenerado(false);
    setCodigoVerificacion("");
    toast({
      title: "Simulador reiniciado",
      description: "Todos los estados han sido restablecidos",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    });
  };

  const downloadSdk = () => {
    const downloadUrl = "/assets/vecinos-notarypro-sdk-dist.js";
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = "vecinos-notarypro-sdk.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Descarga iniciada",
      description: "El SDK se está descargando a su dispositivo",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-8 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">Vecinos SDK para Android</h1>
          <p className="text-muted-foreground mt-2">
            Herramienta completa para tablets Android de puntos de servicio Vecinos NotaryPro Express
          </p>
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={downloadSdk}
          >
            <Download size={16} />
            Descargar SDK
          </Button>
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => setActiveTab("documentacion")}
          >
            <FileCode size={16} />
            Documentación
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="simulador" className="flex items-center gap-2">
            <Smartphone size={16} />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="documentacion" className="flex items-center gap-2">
            <FileCode size={16} />
            Documentación
          </TabsTrigger>
          <TabsTrigger value="instalacion" className="flex items-center gap-2">
            <Laptop size={16} />
            Guía de Instalación
          </TabsTrigger>
          <TabsTrigger value="avanzado" className="flex items-center gap-2">
            <Info size={16} />
            Funciones Avanzadas
          </TabsTrigger>
        </TabsList>

        {/* TAB: Simulador */}
        <TabsContent value="simulador" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la Tienda</CardTitle>
                  <CardDescription>
                    Datos del punto de servicio Vecinos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreTienda">Nombre de la Tienda</Label>
                    <Input 
                      id="nombreTienda" 
                      name="nombreTienda" 
                      value={formData.nombreTienda} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input 
                      id="direccion" 
                      name="direccion" 
                      value={formData.direccion} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Región</Label>
                      <Input 
                        id="region" 
                        name="region" 
                        value={formData.region} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comuna">Comuna</Label>
                      <Input 
                        id="comuna" 
                        name="comuna" 
                        value={formData.comuna} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="id">ID de Tienda</Label>
                      <Input 
                        id="id" 
                        name="id" 
                        value={formData.id} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input 
                        id="apiKey" 
                        name="apiKey" 
                        value={formData.apiKey} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <div className="relative mx-auto bg-gray-900 rounded-t-xl p-4 max-w-3xl">
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1 h-16 bg-gray-700 rounded-r-md"></div>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-16 bg-gray-700 rounded-l-md"></div>
                <div className="bg-white rounded-lg p-4 h-[600px] overflow-y-auto">
                  <div className="bg-primary text-white py-2 px-4 rounded-md mb-4 flex justify-between items-center">
                    <span className="font-semibold">NotaryPro Express - Simulador</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="bg-gray-50 pb-2">
                        <CardTitle className="text-lg">PASO 1: Registrar Cliente</CardTitle>
                        <CardDescription>
                          {clienteRegistrado ? (
                            <span className="text-green-600 font-medium">✓ Cliente registrado</span>
                          ) : (
                            "Ingrese los datos del cliente para el trámite"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input 
                              id="nombre" 
                              name="nombre" 
                              value={clienteForm.nombre} 
                              onChange={handleClienteChange}
                              disabled={clienteRegistrado}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rut">RUT</Label>
                            <Input 
                              id="rut" 
                              name="rut" 
                              value={clienteForm.rut} 
                              onChange={handleClienteChange}
                              disabled={clienteRegistrado}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              name="email" 
                              value={clienteForm.email} 
                              onChange={handleClienteChange}
                              disabled={clienteRegistrado}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input 
                              id="telefono" 
                              name="telefono" 
                              value={clienteForm.telefono} 
                              onChange={handleClienteChange}
                              disabled={clienteRegistrado}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button 
                          onClick={handleRegistrarCliente} 
                          disabled={clienteRegistrado}
                          variant={clienteRegistrado ? "secondary" : "default"}
                        >
                          {clienteRegistrado ? "Cliente Registrado" : "Registrar Cliente"}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="bg-gray-50 pb-2">
                        <CardTitle className="text-lg">PASO 2: Procesar Documento</CardTitle>
                        <CardDescription>
                          {documentoProcesado ? (
                            <span className="text-green-600 font-medium">✓ Documento procesado</span>
                          ) : (
                            "Complete la información del documento a tramitar"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de Documento</Label>
                            <Select 
                              disabled={documentoProcesado}
                              defaultValue={documentoForm.tipo}
                              onValueChange={(value) => handleSelectChange("tipo", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Tipos de Documento</SelectLabel>
                                  <SelectItem value="poder">Poder Simple</SelectItem>
                                  <SelectItem value="declaracion_jurada">Declaración Jurada</SelectItem>
                                  <SelectItem value="contrato">Contrato</SelectItem>
                                  <SelectItem value="certificado">Certificado</SelectItem>
                                  <SelectItem value="finiquito">Finiquito</SelectItem>
                                  <SelectItem value="otro">Otro Documento</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="titulo">Título del Documento</Label>
                            <Input 
                              id="titulo" 
                              name="titulo" 
                              value={documentoForm.titulo} 
                              onChange={handleDocumentoChange}
                              disabled={documentoProcesado}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="detalle">Detalle (opcional)</Label>
                          <Input 
                            id="detalle" 
                            name="detalle" 
                            value={documentoForm.detalle} 
                            onChange={handleDocumentoChange}
                            disabled={documentoProcesado}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="monto">Monto (CLP)</Label>
                            <Input 
                              id="monto" 
                              name="monto" 
                              value={documentoForm.monto} 
                              onChange={handleDocumentoChange}
                              disabled={documentoProcesado}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="metodoPago">Método de Pago</Label>
                            <Select 
                              disabled={documentoProcesado}
                              defaultValue={documentoForm.metodoPago}
                              onValueChange={(value) => handleSelectChange("metodoPago", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar método" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Métodos de Pago</SelectLabel>
                                  <SelectItem value="efectivo">Efectivo</SelectItem>
                                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                  <SelectItem value="transferencia">Transferencia</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button 
                          onClick={handleProcesarDocumento} 
                          disabled={documentoProcesado || !clienteRegistrado}
                          variant={documentoProcesado ? "secondary" : "default"}
                        >
                          {documentoProcesado ? "Documento Procesado" : "Procesar Documento"}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="bg-gray-50 pb-2">
                        <CardTitle className="text-lg">PASO 3: Generar Recibo</CardTitle>
                        <CardDescription>
                          {reciboGenerado ? (
                            <span className="text-green-600 font-medium">✓ Recibo generado</span>
                          ) : (
                            "Genere un recibo y código de verificación para el cliente"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {reciboGenerado ? (
                          <div className="border rounded-md p-4 bg-gray-50">
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-bold text-primary">NotaryPro Express</h3>
                              <p className="text-sm text-muted-foreground">{formData.nombreTienda}</p>
                              <p className="text-xs text-muted-foreground">{formData.direccion}, {formData.comuna}</p>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">Cliente:</span>
                                <span>{clienteForm.nombre}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">RUT:</span>
                                <span>{clienteForm.rut}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Documento:</span>
                                <span>{documentoForm.titulo}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Monto:</span>
                                <span>${parseInt(documentoForm.monto).toLocaleString('es-CL')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Fecha:</span>
                                <span>{new Date().toLocaleDateString('es-CL')}</span>
                              </div>
                            </div>
                            <div className="mt-4 border-t border-dashed pt-4">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Código de verificación:</p>
                                <p className="font-bold text-lg">{codigoVerificacion}</p>
                                <p className="text-xs text-muted-foreground mt-2">Verifique su documento en:</p>
                                <p className="text-xs text-primary">cerfidoc.cl/verificar</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground mb-4">
                              Complete los pasos anteriores para generar un recibo para el cliente
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <Button 
                          onClick={handleGenerarRecibo} 
                          disabled={reciboGenerado || !documentoProcesado}
                          variant={reciboGenerado ? "secondary" : "default"}
                        >
                          {reciboGenerado ? "Recibo Generado" : "Generar Recibo"}
                        </Button>
                        
                        {reciboGenerado && (
                          <Button 
                            variant="outline"
                            onClick={() => copyToClipboard(codigoVerificacion)}
                            className="flex items-center gap-2"
                          >
                            {copied ? (
                              <>
                                <Check size={16} />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                Copiar Código
                              </>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="destructive" 
                        onClick={handleReiniciar}
                        disabled={!clienteRegistrado && !documentoProcesado && !reciboGenerado}
                      >
                        Reiniciar Simulador
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-black h-6 max-w-3xl mx-auto rounded-b-xl"></div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: Documentación */}
        <TabsContent value="documentacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentación - SDK Vecinos NotaryPro Express</CardTitle>
              <CardDescription>
                API de referencia y ejemplos de uso para el SDK de integración para tablets Android
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Introducción</h3>
                <p className="text-muted-foreground">
                  El SDK de Vecinos NotaryPro Express está diseñado para facilitar la integración de los puntos de servicio con la plataforma central. Este SDK simplifica el proceso de registro de clientes, procesamiento de documentos y generación de recibos, incluso cuando no hay conexión a internet.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Referencia de la API</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Inicialización del SDK</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto">
{`// Inicializar el SDK con la configuración de la tienda
const miPuntoDeServicio = new VecinosPOS({
  id: "12345",              // ID único del punto de servicio
  nombre: "Mi Tienda",      // Nombre comercial
  direccion: "Av Principal 123", // Dirección física
  region: "Metropolitana",  // Región de Chile
  comuna: "Santiago",       // Comuna
  apiKey: "vns_xxxxx"       // Clave proporcionada por NotaryPro
});`}
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Esta inicialización establece la conexión con los servidores de NotaryPro y configura el almacenamiento local para funcionamiento sin conexión.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Paso 1: Registrar Cliente</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto">
{`// Registrar un nuevo cliente o buscar uno existente
const resultado = await miPuntoDeServicio.registrarCliente({
  nombre: "Juan Pérez",
  rut: "12.345.678-9",
  email: "juan@ejemplo.cl",
  telefono: "+56912345678"  // Opcional
});

console.log("Cliente registrado con ID:", resultado.id);

// Alternativamente, buscar cliente existente por RUT
const clienteExistente = await miPuntoDeServicio.buscarClientePorRut("12.345.678-9");
if (clienteExistente) {
  console.log("Cliente encontrado:", clienteExistente);
}`}
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        La función registrarCliente devuelve un objeto con el ID del cliente y sus datos. Si el cliente ya existe, buscarClientePorRut permite recuperar su información.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Paso 2: Procesar Documento</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto">
{`// Constantes disponibles para tipos de documento
// TIPO_DOCUMENTO.PODER
// TIPO_DOCUMENTO.DECLARACION_JURADA
// TIPO_DOCUMENTO.CONTRATO
// TIPO_DOCUMENTO.CERTIFICADO
// TIPO_DOCUMENTO.FINIQUITO
// TIPO_DOCUMENTO.OTRO

// Constantes para métodos de pago
// METODO_PAGO.EFECTIVO
// METODO_PAGO.TARJETA
// METODO_PAGO.TRANSFERENCIA

// Procesar un documento para el cliente registrado
const resultadoDoc = await miPuntoDeServicio.procesarDocumento(
  resultado.id,  // ID del cliente obtenido en el paso 1
  {
    tipo: TIPO_DOCUMENTO.PODER,
    titulo: "Poder Simple para Trámite",
    detalle: "Autorización para realizar trámite administrativo", // Opcional
    monto: 15000,  // Monto en pesos chilenos
    metodoPago: METODO_PAGO.EFECTIVO
  }
);

console.log("Documento procesado:", resultadoDoc);
// { documentoId: 12345, estado: "recibido" }`}
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        El documento se enviará automáticamente al servidor cuando haya conexión a internet. Mientras tanto, se almacena localmente y se puede seguir operando.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Paso 3: Generar Recibo</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto">
{`// Generar un recibo para entregar al cliente
const recibo = await miPuntoDeServicio.imprimirRecibo(
  resultadoDoc.documentoId,
  clienteForm,  // Datos del cliente
  documentoForm // Datos del documento
);

console.log("Recibo generado:", recibo);
// {
//   reciboUrl: "data:text/html...",  // HTML del recibo para imprimir
//   codigoQR: "https://cerfidoc.cl/verificar/ABC123", // URL para código QR
//   verificacionCodigo: "ABC123" // Código para verificar documento
// }

// Para imprimir en impresora térmica conectada por Bluetooth:
// imprimirEnDispositivoBluetooth(recibo.reciboUrl);
`}
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        El recibo incluye un código de verificación único que permite al cliente comprobar la autenticidad del documento en el sitio web de CerfiDoc.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Manejo del Modo Offline</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto">
{`// El SDK maneja automáticamente el modo offline
// No es necesario código adicional

// Para verificar el estado de la conexión:
console.log("¿Modo offline activo?", miPuntoDeServicio.modoOffline);

// Ver documentos pendientes de sincronización:
console.log("Docs pendientes:", miPuntoDeServicio.documentosPendientes);

// Forzar intento de sincronización (normalmente no es necesario)
miPuntoDeServicio._sincronizar();`}
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        El SDK detecta automáticamente cuando no hay conexión a internet y almacena los datos localmente. Cuando se recupera la conexión, sincroniza de forma automática con el servidor central.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Guía de Instalación */}
        <TabsContent value="instalacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guía de Instalación</CardTitle>
              <CardDescription>
                Instrucciones paso a paso para integrar el SDK en su aplicación Android
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requisitos Previos</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Tablet Android con Android 8.0 o superior</li>
                  <li>Android Studio (para desarrollo) o la aplicación NotaryPro Express (para usuario final)</li>
                  <li>Conexión a internet para la sincronización inicial</li>
                  <li>Impresora térmica Bluetooth (opcional, para impresión de recibos)</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Instalación para Desarrolladores</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Paso 1: Descarga el SDK</h4>
                    <p className="text-muted-foreground">
                      Descargue el archivo <code>vecinos-notarypro-sdk.js</code> haciendo clic en el botón "Descargar SDK" en la parte superior de esta página.
                    </p>
                    <div className="flex justify-start mt-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={downloadSdk}
                      >
                        <Download size={16} />
                        Descargar SDK
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Paso 2: Incluir en su Proyecto Android</h4>
                    <p className="text-muted-foreground">
                      Coloque el archivo descargado en la carpeta <code>assets/js/</code> de su proyecto Android.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm overflow-auto">
{`📁 proyecto-android/
  ├── 📁 app/
  │   ├── 📁 src/
  │   │   ├── 📁 main/
  │   │   │   ├── 📁 assets/
  │   │   │   │   ├── 📁 js/
  │   │   │   │   │   └── 📄 vecinos-notarypro-sdk.js   // Ubicar aquí`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Paso 3: Configurar WebView en su Aplicación</h4>
                    <p className="text-muted-foreground">
                      Agregue un WebView a su layout XML:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm overflow-auto">
{`<!-- activity_main.xml -->
<WebView
    android:id="@+id/webView"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />`}
                      </pre>
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Configure el WebView en su actividad Java:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm overflow-auto">
{`// MainActivity.java
WebView webView = findViewById(R.id.webView);
WebSettings webSettings = webView.getSettings();
webSettings.setJavaScriptEnabled(true);
webSettings.setDomStorageEnabled(true);

// Cargar el SDK
webView.loadUrl("file:///android_asset/js/vecinos-notarypro-sdk.js");

// También puede cargar una interfaz HTML personalizada que use el SDK
// webView.loadUrl("file:///android_asset/html/index.html");

// Para comunicación entre Java y JavaScript
webView.addJavascriptInterface(new WebAppInterface(this), "Android");`}
                      </pre>
                    </div>
                    
                    <p className="text-muted-foreground mt-4">
                      Interfaz para comunicación con JavaScript:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm overflow-auto">
{`// WebAppInterface.java
public class WebAppInterface {
    Context mContext;

    WebAppInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public void imprimirRecibo(String reciboHtml) {
        // Código para enviar a impresora Bluetooth
    }
    
    @JavascriptInterface
    public void mostrarMensaje(String mensaje) {
        Toast.makeText(mContext, mensaje, Toast.LENGTH_SHORT).show();
    }
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Paso 4: Inicializar el SDK desde su HTML</h4>
                    <p className="text-muted-foreground">
                      Cree un archivo HTML para la interfaz de usuario:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm overflow-auto">
{`<!-- assets/html/index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vecinos NotaryPro Express</title>
    <script src="../js/vecinos-notarypro-sdk.js"></script>
    <script>
        // Inicializar cuando la página esté cargada
        document.addEventListener('DOMContentLoaded', function() {
            // Configurar el punto de servicio
            window.puntoServicio = new VecinosPOS({
                id: "12345",
                nombre: "Mi Tienda",
                direccion: "Av Principal 123",
                region: "Metropolitana",
                comuna: "Santiago",
                apiKey: "vns_xxxxx"
            });
            
            console.log("SDK inicializado correctamente");
        });
        
        // Funciones para manejar los formularios de la interfaz
        async function registrarCliente() {
            // Obtener datos del formulario
            const nombre = document.getElementById('nombre').value;
            const rut = document.getElementById('rut').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('telefono').value;
            
            try {
                const resultado = await window.puntoServicio.registrarCliente({
                    nombre, rut, email, telefono
                });
                
                // Mostrar mensaje en Android
                Android.mostrarMensaje("Cliente registrado: " + nombre);
                
                return resultado;
            } catch (error) {
                console.error(error);
                Android.mostrarMensaje("Error: " + error.message);
            }
        }
        
        // Más funciones para los otros pasos...
    </script>
</head>
<body>
    <!-- Interfaz de usuario con formularios -->
</body>
</html>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Instalación para Usuarios Finales</h3>
                <p className="text-muted-foreground">
                  Si es un punto de servicio Vecinos y desea instalar la aplicación en su tablet Android, siga estos pasos:
                </p>
                
                <ol className="list-decimal pl-6 space-y-4">
                  <li className="text-muted-foreground">
                    <span className="font-medium text-black dark:text-white">Descargue la aplicación NotaryPro Express</span>
                    <p className="mt-1">
                      La aplicación oficial está disponible en la Play Store o a través del enlace proporcionado por su supervisor de Vecinos.
                    </p>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => window.open('https://play.google.com/store', '_blank')}
                      >
                        <ExternalLink size={16} />
                        Descargar Aplicación
                      </Button>
                    </div>
                  </li>
                  
                  <li className="text-muted-foreground">
                    <span className="font-medium text-black dark:text-white">Ingrese las credenciales de su punto de servicio</span>
                    <p className="mt-1">
                      Al iniciar la aplicación por primera vez, se le solicitará ingresar el ID de su tienda y la clave API proporcionada por su supervisor.
                    </p>
                  </li>
                  
                  <li className="text-muted-foreground">
                    <span className="font-medium text-black dark:text-white">Configure la impresora (opcional)</span>
                    <p className="mt-1">
                      Si dispone de una impresora térmica Bluetooth, vincúlela con su tablet Android y configúrela en la sección "Configuración" de la aplicación.
                    </p>
                  </li>
                  
                  <li className="text-muted-foreground">
                    <span className="font-medium text-black dark:text-white">Realice sincronización inicial</span>
                    <p className="mt-1">
                      Asegúrese de tener conexión a internet para realizar la sincronización inicial con el servidor. Después podrá operar sin conexión.
                    </p>
                  </li>
                </ol>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md mt-4">
                  <p className="text-sm">
                    <span className="font-medium">Nota:</span> Si necesita asistencia durante la instalación, contacte a su supervisor o al soporte técnico de NotaryPro al +56 2 2123 4567.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Funciones Avanzadas */}
        <TabsContent value="avanzado" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funciones Avanzadas</CardTitle>
              <CardDescription>
                Características adicionales para usuarios experimentados y casos de uso específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Manejo de Sincronización</h3>
                <p className="text-muted-foreground">
                  El SDK incluye varias opciones avanzadas para controlar manualmente la sincronización y manejar casos especiales.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm overflow-auto">
{`// Verificar estado de sincronización
const pendientes = miPuntoDeServicio.documentosPendientes.length;
console.log(\`Hay \${pendientes} documentos pendientes de sincronizar\`);

// Forzar intento de sincronización
await miPuntoDeServicio._sincronizar();

// Configurar intervalo personalizado de verificación de conexión
// (por defecto es 5 minutos)
setTimeout(() => miPuntoDeServicio._verificarConexion(), 60000); // 1 minuto

// Obtener estadísticas del punto de servicio
const stats = await miPuntoDeServicio.obtenerEstadisticas();
console.log("Estadísticas:", stats);
// {
//   totalDocumentos: 156,
//   comisionPendiente: 45600,
//   comisionPagada: 230400,
//   totalVentas: 1840000
// }`}
                  </pre>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Integración con Hardware</h3>
                
                <h4 className="font-medium">Impresoras Bluetooth</h4>
                <p className="text-muted-foreground">
                  El SDK genera recibos en formato HTML que pueden enviarse a impresoras térmicas a través de la interfaz JavaScript-Java.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm overflow-auto">
{`// En JavaScript (WebView)
const recibo = await miPuntoDeServicio.imprimirRecibo(documentoId, cliente, documento);

// Enviar a la capa nativa para impresión
Android.imprimirRecibo(recibo.reciboUrl);

// En Java (Android)
@JavascriptInterface
public void imprimirRecibo(String reciboHtml) {
    // Convertir HTML a formato para impresora térmica
    byte[] datos = convertirHTMLaESC_POS(reciboHtml);
    
    // Enviar a la impresora Bluetooth
    BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    BluetoothDevice printer = bluetoothAdapter.getRemoteDevice(PRINTER_ADDRESS);
    
    try {
        BluetoothSocket socket = printer.createRfcommSocketToServiceRecord(
            UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"));
        socket.connect();
        OutputStream out = socket.getOutputStream();
        out.write(datos);
        out.close();
        socket.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}`}
                  </pre>
                </div>
                
                <h4 className="font-medium mt-6">Lectores de Códigos de Barras</h4>
                <p className="text-muted-foreground">
                  Para agilizar la entrada de datos, puede integrar lectores de códigos de barras para capturar rápidamente información del RUT en cédulas de identidad.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm overflow-auto">
{`// Configurar un campo para recibir datos del lector
// En su HTML:
<input type="text" id="rutScanner" placeholder="Escanear RUT" />

// En JavaScript:
document.getElementById('rutScanner').addEventListener('change', function(e) {
    const datosEscaneados = e.target.value;
    
    // Extraer RUT de los datos escaneados
    // Formato típico de cédula chilena: RUN:12345678-9
    const rutMatch = datosEscaneados.match(/RUN:([0-9]+-[0-9kK])/);
    if (rutMatch && rutMatch[1]) {
        const rut = formatearRut(rutMatch[1]);
        document.getElementById('rut').value = rut;
        
        // Automáticamente buscar cliente por RUT
        buscarClientePorRut(rut);
    }
});

function formatearRut(rutSinFormato) {
    // Convertir 12345678-9 a 12.345.678-9
    return rutSinFormato.replace(/^(\d{1,2})(\d{3})(\d{3})([-][0-9kK])$/,
                             '$1.$2.$3$4');
}`}
                  </pre>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Características de Seguridad</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Validación de Datos</h4>
                  <p className="text-muted-foreground">
                    El SDK incluye funciones de validación que puede ampliar para sus necesidades específicas:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="text-sm overflow-auto">
{`// Extender el SDK para agregar validaciones personalizadas
VecinosPOS.prototype.validarRut = function(rut) {
    // Implementar algoritmo de validación de RUT chileno
    // Eliminar puntos y guión
    const rutLimpio = rut.replace(/[.-]/g, '');
    const dv = rutLimpio.slice(-1);
    const rutNumerico = parseInt(rutLimpio.slice(0, -1), 10);
    
    // Algoritmo de validación...
    
    return esValido;
};

// Implementar verificación de autenticidad de documentos
VecinosPOS.prototype.verificarDocumento = async function(codigo) {
    if (this.modoOffline) {
        return { valido: false, razon: "Sin conexión a internet" };
    }
    
    try {
        const response = await fetch(
            \`\${this.apiUrl}/api/verificar/\${codigo}\`,
            {
                headers: { "X-API-KEY": this.config.apiKey }
            }
        );
        
        if (response.ok) {
            const datos = await response.json();
            return {
                valido: true,
                documento: datos
            };
        } else {
            return { 
                valido: false, 
                razon: "Código no válido o documento no encontrado" 
            };
        }
    } catch (error) {
        return { valido: false, razon: error.message };
    }
};`}
                    </pre>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium">Respaldos y Recuperación</h4>
                  <p className="text-muted-foreground">
                    Amplíe las capacidades de almacenamiento local para soportar respaldos y recuperación de datos:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="text-sm overflow-auto">
{`// Exportar todos los datos locales a un archivo JSON
VecinosPOS.prototype.exportarDatos = function() {
    const datos = {
        config: this.config,
        clientes: this.clientesPendientes,
        documentos: this.documentosPendientes,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    return JSON.stringify(datos);
};

// Importar datos desde un respaldo
VecinosPOS.prototype.importarDatos = function(jsonString) {
    try {
        const datos = JSON.parse(jsonString);
        
        // Verificar versión compatible
        if (datos.version !== "1.0") {
            throw new Error("Versión de datos incompatible");
        }
        
        // Restaurar datos
        this.clientesPendientes = datos.clientes;
        this.documentosPendientes = datos.documentos;
        
        // Guardar en almacenamiento local
        this._saveToLocalStorage();
        
        return {
            exito: true,
            clientes: this.clientesPendientes.length,
            documentos: this.documentosPendientes.length
        };
    } catch (error) {
        return {
            exito: false,
            error: error.message
        };
    }
};`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AndroidSdkTest;