import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Smartphone, Download, Clipboard, Check, QrCode, Copy, ExternalLink, Clock, Globe } from 'lucide-react';
import { TIPO_DOCUMENTO, METODO_PAGO, VecinosPOS } from '@/lib/partner-android-sdk';
import { ExplanatoryVideo } from '@/components/onboarding/ExplanatoryVideo';

const SdkDemo = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sdkInstance, setSdkInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [clienteRegistrado, setClienteRegistrado] = useState<any>(null);
  const [documentoProcesado, setDocumentoProcesado] = useState<any>(null);
  const [reciboGenerado, setReciboGenerado] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  // Cliente
  const [cliente, setCliente] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: ''
  });
  
  // Documento
  const [documento, setDocumento] = useState({
    tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
    titulo: '',
    detalle: '',
    monto: 5000,
    metodoPago: METODO_PAGO.EFECTIVO
  });

  // Iniciar el SDK cuando se carga la página
  useEffect(() => {
    if (user && user.role === 'partner') {
      try {
        const pos = new VecinosPOS({
          id: user.id,
          nombre: user.fullName || user.username,
          direccion: 'Dirección del socio',
          region: 'Región Metropolitana',
          comuna: 'Santiago',
          apiKey: 'demo-api-key-123456'
        });
        
        setSdkInstance(pos);
        toast({
          title: 'SDK inicializado correctamente',
          description: 'El punto de servicio está listo para procesar documentos.',
        });
      } catch (error) {
        console.error('Error al inicializar SDK:', error);
        toast({
          title: 'Error al inicializar SDK',
          description: 'No se pudo configurar el punto de servicio.',
          variant: 'destructive'
        });
      }
    }
  }, [user]);

  // Manejo de formularios
  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value
    });
  };
  
  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDocumento({
      ...documento,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setDocumento({
      ...documento,
      [name]: value
    });
  };
  
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setDocumento({
      ...documento,
      monto: value
    });
  };

  // Paso 1: Registrar cliente
  const registrarCliente = async () => {
    if (!sdkInstance) return;
    
    setLoading(true);
    try {
      const resultado = await sdkInstance.registrarCliente(cliente);
      setClienteRegistrado(resultado);
      setStep(2);
      toast({
        title: 'Cliente registrado',
        description: `${cliente.nombre} ha sido registrado exitosamente.`,
      });
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      toast({
        title: 'Error al registrar cliente',
        description: 'No se pudo completar el registro.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Paso 2: Procesar documento
  const procesarDocumento = async () => {
    if (!sdkInstance || !clienteRegistrado) return;
    
    setLoading(true);
    try {
      const resultado = await sdkInstance.procesarDocumento(clienteRegistrado.id, documento);
      setDocumentoProcesado(resultado);
      setStep(3);
      toast({
        title: 'Documento procesado',
        description: `El documento "${documento.titulo}" ha sido procesado exitosamente.`,
      });
    } catch (error) {
      console.error('Error al procesar documento:', error);
      toast({
        title: 'Error al procesar documento',
        description: 'No se pudo completar el procesamiento del documento.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Paso 3: Imprimir recibo
  const imprimirRecibo = async () => {
    if (!sdkInstance || !clienteRegistrado || !documentoProcesado) return;
    
    setLoading(true);
    try {
      const resultado = await sdkInstance.imprimirRecibo(
        documentoProcesado.documentoId,
        cliente,
        documento
      );
      setReciboGenerado(resultado);
      toast({
        title: 'Recibo generado',
        description: `El recibo está listo para ser impreso o enviado.`,
      });
    } catch (error) {
      console.error('Error al generar recibo:', error);
      toast({
        title: 'Error al generar recibo',
        description: 'No se pudo generar el recibo para este documento.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reiniciar proceso
  const reiniciarProceso = () => {
    setCliente({
      nombre: '',
      rut: '',
      email: '',
      telefono: ''
    });
    setDocumento({
      tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
      titulo: '',
      detalle: '',
      monto: 5000,
      metodoPago: METODO_PAGO.EFECTIVO
    });
    setClienteRegistrado(null);
    setDocumentoProcesado(null);
    setReciboGenerado(null);
    setStep(1);
  };
  
  // Copiar SDK al portapapeles
  const copiarSdk = async () => {
    try {
      // Fetch the SDK from the dist file
      const response = await fetch('/assets/vecinos-notarypro-sdk-dist.js');
      const text = await response.text();
      
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      toast({
        title: 'SDK copiado',
        description: 'El código del SDK ha sido copiado al portapapeles.',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar SDK:', error);
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el SDK. Intente descargarlo en su lugar.',
        variant: 'destructive'
      });
    }
  };

  // Sección de descarga pública sin restricción
  // Pero las funciones de demostración necesitan usuario
  const isDownloadOnly = !user || user.role !== 'partner';
  
  // Si el usuario no está autenticado o no es socio, mostrar solo la parte de descarga
  if (isDownloadOnly) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">SDK NotaryPro para Socios Vecinos</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Descargar SDK y Aplicaciones</CardTitle>
            <CardDescription>
              Archivos disponibles para su implementación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="mb-4">
                Estos son los archivos necesarios para implementar el sistema de puntos de servicio Vecinos NotaryPro Express.
                Para acceder a la demostración interactiva, por favor inicie sesión como socio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SDK para Desarrolladores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Archivo JavaScript con todas las funciones necesarias para operar
                    un punto de servicio NotaryPro.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = "/downloads/vecinos-notarypro-sdk.js";
                      link.download = "vecinos-notarypro-sdk.js";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar SDK
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Android App (Punto de venta)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Aplicación Android completa que incluye el SDK integrado.
                    Ideal para socios sin conocimientos técnicos.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = "/partners/descargar-apk"}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar APK Vecinos v1.2.0
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Guía de implementación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Manual detallado con instrucciones paso a paso para
                    la implementación y uso del SDK.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = "/downloads/guia-implementacion-sdk.txt";
                      link.download = "guia-implementacion-sdk.txt";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Descargar Guía
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">SDK NotaryPro para Socios Vecinos</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Vista general</TabsTrigger>
          <TabsTrigger value="demo">Demostración</TabsTrigger>
          <TabsTrigger value="documentation">Documentación</TabsTrigger>
          <TabsTrigger value="download">Descargar SDK</TabsTrigger>
        </TabsList>

        {/* VISTA GENERAL */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>SDK Vecinos NotaryPro Express</CardTitle>
                  <CardDescription>
                    Una herramienta simple y potente para procesar documentos notariales desde su negocio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    Nuestro SDK (Kit de Desarrollo de Software) permite a cualquier socio del programa
                    Vecinos NotaryPro Express procesar documentos notariales digitales de forma rápida y sencilla,
                    sin necesidad de conocimientos técnicos avanzados.
                  </p>
                  
                  <div className="bg-primary/10 p-4 rounded-md">
                    <h3 className="font-medium text-lg mb-2">Características principales:</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <strong>Fácil instalación</strong> - Diseñado para funcionar en cualquier dispositivo Android
                        con configuración mínima
                      </li>
                      <li>
                        <strong>Modo offline</strong> - Funciona incluso sin conexión a internet, sincronizando
                        automáticamente cuando vuelve la conexión
                      </li>
                      <li>
                        <strong>Interfaz simple</strong> - Solo 3 pasos para procesar cualquier documento:
                        registrar cliente, procesar documento e imprimir recibo
                      </li>
                      <li>
                        <strong>Comisiones automáticas</strong> - Registra automáticamente sus comisiones por
                        cada documento procesado (15% del monto)
                      </li>
                      <li>
                        <strong>Seguridad integrada</strong> - Protección de datos y autenticación automática
                        con la plataforma central
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button onClick={() => setActiveTab('demo')}>
                      Probar demostración
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('download')}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar SDK
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Video tutorial</CardTitle>
                  <CardDescription>
                    Aprenda a utilizar el SDK en pocos minutos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExplanatoryVideo 
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                    title="Tutorial del SDK para socios Vecinos"
                    poster="/assets/video-thumbnail.png"
                  />
                  
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">Requisitos mínimos:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Smartphone className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                        <span>Tablet Android 5.0+ o dispositivo similar</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                        <span>Navegador web compatible con JavaScript</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                        <span>Cuenta activa en el programa Vecinos</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* DEMOSTRACIÓN INTERACTIVA */}
        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle>Demostración del SDK</CardTitle>
              <CardDescription>
                Pruebe el funcionamiento del SDK en tiempo real con esta demo interactiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Pasos del proceso */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-gray-100 p-4 rounded-md mb-6">
                    <h3 className="font-medium mb-2">Estado actual:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-3 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-300'}`}>
                          1
                        </div>
                        <span className={step >= 1 ? 'font-medium' : ''}>Registrar cliente</span>
                        {step > 1 && <Check className="ml-2 h-4 w-4 text-green-600" />}
                      </li>
                      <li className="flex items-center">
                        <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-3 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-300'}`}>
                          2
                        </div>
                        <span className={step >= 2 ? 'font-medium' : ''}>Procesar documento</span>
                        {step > 2 && <Check className="ml-2 h-4 w-4 text-green-600" />}
                      </li>
                      <li className="flex items-center">
                        <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-3 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-300'}`}>
                          3
                        </div>
                        <span className={step >= 3 ? 'font-medium' : ''}>Imprimir recibo</span>
                        {reciboGenerado && <Check className="ml-2 h-4 w-4 text-green-600" />}
                      </li>
                    </ul>
                  </div>
                  
                  {/* Paso 1: Registrar cliente */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Paso 1: Registrar cliente</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="nombre">Nombre completo</Label>
                          <Input
                            id="nombre"
                            name="nombre"
                            value={cliente.nombre}
                            onChange={handleClienteChange}
                            placeholder="Ej: María González Pérez"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rut">RUT</Label>
                          <Input
                            id="rut"
                            name="rut"
                            value={cliente.rut}
                            onChange={handleClienteChange}
                            placeholder="Ej: 12.345.678-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={cliente.email}
                            onChange={handleClienteChange}
                            placeholder="Ej: maria@ejemplo.cl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono">Teléfono (opcional)</Label>
                          <Input
                            id="telefono"
                            name="telefono"
                            value={cliente.telefono}
                            onChange={handleClienteChange}
                            placeholder="Ej: 912345678"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={registrarCliente} 
                        disabled={loading || !cliente.nombre || !cliente.rut || !cliente.email}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          'Registrar cliente'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Paso 2: Procesar documento */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Paso 2: Procesar documento</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="tipo">Tipo de documento</Label>
                          <Select 
                            value={documento.tipo} 
                            onValueChange={(value) => handleSelectChange('tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TIPO_DOCUMENTO.PODER}>Poder</SelectItem>
                              <SelectItem value={TIPO_DOCUMENTO.DECLARACION_JURADA}>Declaración jurada</SelectItem>
                              <SelectItem value={TIPO_DOCUMENTO.CONTRATO}>Contrato</SelectItem>
                              <SelectItem value={TIPO_DOCUMENTO.CERTIFICADO}>Certificado</SelectItem>
                              <SelectItem value={TIPO_DOCUMENTO.FINIQUITO}>Finiquito</SelectItem>
                              <SelectItem value={TIPO_DOCUMENTO.OTRO}>Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="titulo">Título del documento</Label>
                          <Input
                            id="titulo"
                            name="titulo"
                            value={documento.titulo}
                            onChange={handleDocumentoChange}
                            placeholder="Ej: Declaración jurada de residencia"
                          />
                        </div>
                        <div>
                          <Label htmlFor="detalle">Detalle (opcional)</Label>
                          <Textarea
                            id="detalle"
                            name="detalle"
                            value={documento.detalle}
                            onChange={handleDocumentoChange}
                            placeholder="Ej: Para trámite municipal"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="monto">Monto (CLP)</Label>
                          <Input
                            id="monto"
                            name="monto"
                            type="number"
                            value={documento.monto}
                            onChange={handleMontoChange}
                            placeholder="Ej: 5000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="metodoPago">Método de pago</Label>
                          <Select 
                            value={documento.metodoPago} 
                            onValueChange={(value) => handleSelectChange('metodoPago', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={METODO_PAGO.EFECTIVO}>Efectivo</SelectItem>
                              <SelectItem value={METODO_PAGO.TARJETA}>Tarjeta</SelectItem>
                              <SelectItem value={METODO_PAGO.TRANSFERENCIA}>Transferencia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          Volver
                        </Button>
                        <Button 
                          onClick={procesarDocumento} 
                          disabled={loading || !documento.titulo || !documento.monto}
                          className="flex-1"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            'Procesar documento'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Paso 3: Imprimir recibo */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Paso 3: Imprimir recibo</h3>
                      <p className="text-sm text-gray-500">
                        Genere e imprima un recibo para el cliente. Este recibo incluirá
                        un código QR para verificar la autenticidad del documento.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Documento:</span>
                            <span className="font-medium">{documento.titulo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Tipo:</span>
                            <span>{documento.tipo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Monto:</span>
                            <span className="font-medium">${documento.monto.toLocaleString('es-CL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Comisión (15%):</span>
                            <span className="text-green-600 font-medium">
                              ${Math.round(documento.monto * 0.15).toLocaleString('es-CL')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setStep(2)}
                          className="flex-1"
                        >
                          Volver
                        </Button>
                        <Button 
                          onClick={imprimirRecibo} 
                          disabled={loading}
                          className="flex-1"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generando...
                            </>
                          ) : reciboGenerado ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Recibo generado
                            </>
                          ) : (
                            'Generar recibo'
                          )}
                        </Button>
                      </div>
                      
                      {reciboGenerado && (
                        <Button 
                          variant="secondary" 
                          onClick={reiniciarProceso}
                          className="w-full mt-4"
                        >
                          Iniciar nuevo proceso
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Consola y vista previa */}
                <div className="md:col-span-3 space-y-6">
                  <div className="border rounded-md">
                    <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
                      <span className="font-medium text-sm">Consola SDK</span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Online
                      </span>
                    </div>
                    <div className="p-4 h-96 bg-gray-900 text-gray-200 font-mono text-xs overflow-y-auto">
                      {/* Log ficticio para simular actividad */}
                      <div className="space-y-1">
                        <div>
                          <span className="text-blue-400">[INFO]</span> Iniciando SDK Vecinos NotaryPro Express v1.0...
                        </div>
                        <div>
                          <span className="text-green-400">[OK]</span> Punto de servicio configurado correctamente: {user.businessName || user.fullName || user.username}
                        </div>
                        <div>
                          <span className="text-blue-400">[INFO]</span> Verificando conexión a internet...
                        </div>
                        <div>
                          <span className="text-green-400">[OK]</span> Conexión a internet disponible
                        </div>
                        
                        {clienteRegistrado && (
                          <>
                            <div>
                              <span className="text-blue-400">[INFO]</span> Registrando cliente: {cliente.nombre}
                            </div>
                            <div>
                              <span className="text-green-400">[OK]</span> Cliente registrado correctamente con ID: {clienteRegistrado.id}
                            </div>
                          </>
                        )}
                        
                        {documentoProcesado && (
                          <>
                            <div>
                              <span className="text-blue-400">[INFO]</span> Procesando documento: {documento.titulo}
                            </div>
                            <div>
                              <span className="text-green-400">[OK]</span> Documento procesado correctamente con ID: {documentoProcesado.documentoId}
                            </div>
                            <div>
                              <span className="text-blue-400">[INFO]</span> Estado del documento: {documentoProcesado.estado}
                            </div>
                            <div>
                              <span className="text-green-400">[OK]</span> Comisión registrada: ${Math.round(documento.monto * 0.15).toLocaleString('es-CL')}
                            </div>
                          </>
                        )}
                        
                        {reciboGenerado && (
                          <>
                            <div>
                              <span className="text-blue-400">[INFO]</span> Generando recibo para documento: {documentoProcesado.documentoId}
                            </div>
                            <div>
                              <span className="text-green-400">[OK]</span> Recibo generado correctamente
                            </div>
                            <div>
                              <span className="text-blue-400">[INFO]</span> Código QR de verificación generado
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {reciboGenerado && (
                    <div className="border p-4 rounded-md">
                      <h3 className="font-medium text-lg mb-4">Vista previa del recibo</h3>
                      <div className="border-2 border-dashed p-4 rounded-md">
                        <div className="text-center mb-4">
                          <h4 className="font-bold text-lg">NotaryPro Express</h4>
                          <p className="text-sm">Punto de servicio: {user.businessName || user.fullName || user.username}</p>
                          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('es-CL')}</p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <h5 className="font-medium">Información del cliente:</h5>
                          <p>Nombre: {cliente.nombre}</p>
                          <p>RUT: {cliente.rut}</p>
                          <p>Email: {cliente.email}</p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <h5 className="font-medium">Información del documento:</h5>
                          <p>Tipo: {documento.tipo}</p>
                          <p>Título: {documento.titulo}</p>
                          <p>Detalle: {documento.detalle || 'N/A'}</p>
                          <p className="font-medium">Monto: ${documento.monto.toLocaleString('es-CL')}</p>
                          <p>Método de pago: {documento.metodoPago}</p>
                        </div>
                        
                        <div className="border-t pt-4 text-center">
                          <div className="mb-2">
                            <QrCode className="h-24 w-24 mx-auto" />
                          </div>
                          <p className="text-xs">
                            Verificar: cerfidoc.cl/verificar - Documento #{documentoProcesado.documentoId}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTACIÓN */}
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentación del SDK</CardTitle>
              <CardDescription>
                Guía completa para implementar y utilizar el SDK en su punto de servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Instalación</h3>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Requisitos previos</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tableta Android 5.0 o superior</li>
                    <li>Navegador web actualizado con soporte para JavaScript</li>
                    <li>Cuenta activa en el programa Vecinos NotaryPro Express</li>
                    <li>Opcional: Impresora térmica Bluetooth para recibos</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Pasos de instalación</h4>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      <p className="font-medium">Descargar el archivo SDK</p>
                      <p className="text-sm text-gray-600">
                        Descargue el archivo <code>vecinos-notarypro-sdk.js</code> desde la pestaña "Descargar SDK".
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Crear proyecto Android (para desarrolladores)</p>
                      <p className="text-sm text-gray-600">
                        Si está creando una aplicación personalizada, añada el archivo a su proyecto
                        Android en la carpeta <code>assets/js/</code>.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Para usuarios no técnicos</p>
                      <p className="text-sm text-gray-600">
                        Utilice nuestra app "Vecinos POS" disponible en Google Play Store que ya
                        incluye el SDK integrado.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Guía de uso rápido</h3>
                <p>
                  El SDK está diseñado para ser utilizado en 3 simples pasos:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="rounded-full bg-primary/10 h-10 w-10 flex items-center justify-center mb-3">
                      <span className="font-medium text-primary">1</span>
                    </div>
                    <h4 className="font-medium mb-1">Registrar cliente</h4>
                    <p className="text-sm text-gray-600">
                      Registre los datos del cliente que solicita el servicio.
                      Si el cliente ya existe, se recuperarán sus datos automáticamente.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="rounded-full bg-primary/10 h-10 w-10 flex items-center justify-center mb-3">
                      <span className="font-medium text-primary">2</span>
                    </div>
                    <h4 className="font-medium mb-1">Procesar documento</h4>
                    <p className="text-sm text-gray-600">
                      Registre los detalles del documento a procesar, incluyendo
                      tipo, título y monto cobrado.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="rounded-full bg-primary/10 h-10 w-10 flex items-center justify-center mb-3">
                      <span className="font-medium text-primary">3</span>
                    </div>
                    <h4 className="font-medium mb-1">Imprimir recibo</h4>
                    <p className="text-sm text-gray-600">
                      Genere un recibo para el cliente con código QR de verificación.
                      El recibo puede imprimirse o enviarse por email.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium">API de referencia</h3>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <code className="font-mono text-sm">
                      const pos = new VecinosPOS(config)
                    </code>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Constructor</h4>
                    <p className="text-sm mb-3">
                      Inicializa un nuevo punto de servicio con la configuración proporcionada.
                    </p>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Parámetros:</h5>
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <pre className="text-xs overflow-x-auto">
{`config: {
  id: number,         // ID de su punto de servicio
  nombre: string,     // Nombre de su negocio
  direccion: string,  // Dirección física
  region: string,     // Región de Chile
  comuna: string,     // Comuna
  apiKey: string      // Clave API proporcionada por NotaryPro
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden mt-4">
                  <div className="bg-gray-50 p-3 border-b">
                    <code className="font-mono text-sm">
                      async pos.registrarCliente(cliente)
                    </code>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Registrar cliente</h4>
                    <p className="text-sm mb-3">
                      Registra un cliente nuevo o busca uno existente por su RUT.
                    </p>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Parámetros:</h5>
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <pre className="text-xs overflow-x-auto">
{`cliente: {
  nombre: string,     // Nombre completo del cliente
  rut: string,        // RUT con formato XX.XXX.XXX-X
  email: string,      // Correo electrónico
  telefono?: string   // Teléfono (opcional)
}`}
                      </pre>
                    </div>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Retorna:</h5>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs overflow-x-auto">
{`{
  id: number,         // ID del cliente
  cliente: {...}      // Datos del cliente
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden mt-4">
                  <div className="bg-gray-50 p-3 border-b">
                    <code className="font-mono text-sm">
                      async pos.procesarDocumento(clienteId, documento)
                    </code>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Procesar documento</h4>
                    <p className="text-sm mb-3">
                      Registra un nuevo documento para el cliente especificado.
                    </p>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Parámetros:</h5>
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <pre className="text-xs overflow-x-auto">
{`clienteId: number,   // ID del cliente (del paso anterior)

documento: {
  tipo: string,       // Use constantes TIPO_DOCUMENTO
  titulo: string,     // Título descriptivo
  detalle?: string,   // Información adicional (opcional)
  monto: number,      // Monto en pesos chilenos
  metodoPago: string  // Use constantes METODO_PAGO
}`}
                      </pre>
                    </div>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Retorna:</h5>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs overflow-x-auto">
{`{
  documentoId: number,      // ID del documento
  estado: string            // Estado inicial (RECIBIDO)
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden mt-4">
                  <div className="bg-gray-50 p-3 border-b">
                    <code className="font-mono text-sm">
                      async pos.imprimirRecibo(documentoId, cliente, documento)
                    </code>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Imprimir recibo</h4>
                    <p className="text-sm mb-3">
                      Genera e imprime un recibo para el documento procesado.
                    </p>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Parámetros:</h5>
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <pre className="text-xs overflow-x-auto">
{`documentoId: number,      // ID del documento (del paso anterior)
cliente: {...},            // Datos completos del cliente
documento: {...}           // Datos completos del documento`}
                      </pre>
                    </div>
                    
                    <h5 className="font-medium text-sm mt-4 mb-2">Retorna:</h5>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs overflow-x-auto">
{`{
  reciboUrl: string,       // URL del recibo HTML
  codigoQR: string         // Código QR de verificación
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DESCARGAR SDK */}
        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle>Descargar SDK</CardTitle>
              <CardDescription>
                Obtenga el SDK para implementarlo en su punto de servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-md border">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">SDK Vecinos NotaryPro Express v1.0</h3>
                    <p className="text-gray-600 mb-4">
                      Archivo JavaScript con todas las funciones necesarias para operar
                      un punto de servicio NotaryPro. Compatible con Android 5.0+.
                    </p>
                    <ul className="text-sm space-y-2 mb-4">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Tamaño: 27KB - Optimizado para carga rápida</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Sin dependencias externas - Funciona independientemente</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Almacenamiento local - Opera incluso sin conexión</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = "/downloads/vecinos-notarypro-sdk.js";
                        link.download = "vecinos-notarypro-sdk.js";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar SDK
                    </Button>
                    
                    <Button variant="outline" className="w-full" onClick={copiarSdk}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar código
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => window.open("https://github.com/cerfidoc/vecinos-sdk/issues", "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Reportar problemas
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Android App (Punto de venta)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Aplicación Android completa que incluye el SDK integrado.
                      Ideal para socios sin conocimientos técnicos.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = "/partners/descargar-apk"}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar APK
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Versión Web</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Utilice nuestra versión web cuando no pueda usar la app Android.
                      Funciona en cualquier navegador.
                    </p>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = "/vecinos/login"}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Versión con botones grandes
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = "/vecinos/login"}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Versión con pestañas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">iOS App (Próximamente)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Nuestra aplicación para iOS está en desarrollo.
                      Pronto disponible en App Store.
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="mr-2 h-4 w-4" />
                      En desarrollo
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Guía de implementación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Manual detallado con instrucciones paso a paso para
                      la implementación y uso del SDK.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = "/downloads/guia-implementacion-sdk.txt";
                        link.download = "guia-implementacion-sdk.txt";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Clipboard className="mr-2 h-4 w-4" />
                      Descargar Guía
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-md">
                <h3 className="font-medium mb-2">¿Necesita ayuda técnica?</h3>
                <p className="text-sm">
                  Ofrecemos soporte técnico completo para la implementación del SDK.
                  Contacte a nuestro equipo de soporte técnico a través del correo
                  <button 
                    onClick={() => window.location.href = "mailto:soporte@cerfidoc.cl"} 
                    className="text-primary font-medium ml-1 bg-transparent border-none p-0 cursor-pointer"
                    style={{ textDecoration: 'underline' }}
                  >
                    soporte@cerfidoc.cl
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SdkDemo;