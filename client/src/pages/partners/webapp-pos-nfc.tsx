import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, ArrowLeft, CheckCircle2, Printer, UserPlus, FileText, 
  CreditCard, ChevronRight, FileSignature, UserCheck, Shield, 
  Camera, RefreshCw, Download, X, Fingerprint, ClipboardList,
  CheckSquare, FileCheck, Home, User, LogOut, Wallet, 
  Mail, MessageCircle
} from 'lucide-react';
import NFCIdentityReader from '@/components/identity/NFCIdentityReader';
import { CedulaChilenaData, checkNFCAvailability } from '@/lib/nfc-reader';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const WebAppPOSNFC = () => {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState('inicio');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [procesoCompletado, setProcesoCompletado] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showCertifierPanel, setShowCertifierPanel] = useState(false);
  const [signatureImage, setSignatureImage] = useState('');
  const [certificadorMode, setCertificadorMode] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para NFC y verificación de identidad
  const [showCamera, setShowCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showNFCReader, setShowNFCReader] = useState(false);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [cedulaData, setCedulaData] = useState<CedulaChilenaData | null>(null);
  
  // Estado para múltiples firmantes
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0); // 0 = primer firmante, 1 = segundo firmante
  const [signatureImages, setSignatureImages] = useState<string[]>(['', '']);
  const [secondSignerVerified, setSecondSignerVerified] = useState(false);
  const [firmantes, setFirmantes] = useState<Array<{
    nombre: string;
    rut: string;
    relacion: string;
  }>>([]);
  const { toast } = useToast();
  
  // Cargar información del socio al inicio y verificar NFC
  useEffect(() => {
    // Para demostración, cargar información de socio de prueba
    const loadDemoPartner = () => {
      setPartnerInfo({
        id: 1,
        storeName: "Minimarket El Sol (DEMO)",
        address: "Av. Providencia 123, Santiago",
        storeCode: "LOCAL-XP125",
        commission: 10,
        balance: 25600
      });
      
      toast({
        title: "Modo demostración",
        description: "Estás viendo la página en modo de prueba"
      });
      
      setLoading(false);
    };
    
    // Verificar disponibilidad de NFC
    const checkNFC = async () => {
      try {
        const result = await checkNFCAvailability();
        setNfcAvailable(result.available);
        
        if (result.available) {
          console.log(`NFC disponible: ${result.readerType}`);
          toast({
            title: "NFC detectado",
            description: `Tipo de lector: ${result.readerType}`,
          });
        } else {
          console.log("NFC no disponible");
          toast({
            title: "NFC no disponible",
            description: "Su dispositivo no tiene NFC o no está habilitado",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al verificar NFC:', error);
        setNfcAvailable(false);
      }
    };
    
    // Cargar datos de demo y verificar NFC
    loadDemoPartner();
    checkNFC();
  }, []);
  
  // Referencias para el canvas de firma
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Para la captura de foto de identidad
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  
  // Estado para previsualización de documento
  const [documentPreview, setDocumentPreview] = useState('');
  
  // Información del cliente
  const [clienteInfo, setClienteInfo] = useState({
    nombre: 'Juan Pérez González',
    rut: '12.345.678-9',
    email: 'juan@ejemplo.cl',
    telefono: '+56 9 1234 5678'
  });
  
  // Lista de documentos disponibles
  const documentosDisponibles = [
    { id: 'contrato', nombre: 'Contrato de Prestación de Servicios', precio: 3200 },
    { id: 'declaracion', nombre: 'Declaración Jurada Simple', precio: 2500 },
    { id: 'autorizacion', nombre: 'Autorización de Viaje', precio: 4000 },
    { id: 'finiquito', nombre: 'Finiquito Laboral', precio: 3800 },
    { id: 'compraventa', nombre: 'Contrato de Compra-Venta', precio: 3600 },
    { id: 'arriendo', nombre: 'Contrato de Arriendo', precio: 3900 }
  ];
  
  // Handlers para los pasos del proceso
  const handleRegistrarCliente = () => {
    // Validar datos del cliente antes de continuar
    if (clienteInfo.nombre.trim().length < 3 || 
        clienteInfo.rut.trim().length < 5 || 
        clienteInfo.telefono.trim().length < 8) {
      toast({
        title: "Datos incompletos",
        description: "Debes completar los datos del cliente para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setStep('documentos');
  };
  
  const handleSeleccionarDocumento = (docId: string) => {
    setTipoDocumento(docId);
    
    // Toast de selección exitosa
    const doc = documentosDisponibles.find(d => d.id === docId);
    if (doc) {
      toast({
        title: "Documento seleccionado",
        description: `Has seleccionado: ${doc.nombre}`,
      });
    }
    
    setStep('pago');
  };
  
  const handleSeleccionarPago = (metodo: string) => {
    setMetodoPago(metodo);
    
    // Toast de método de pago seleccionado
    toast({
      title: "Método de pago seleccionado",
      description: `Método de pago: ${metodo.toUpperCase()}`,
    });
    
    // Mostrar preview antes de continuar
    const docSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
    if (docSeleccionado) {
      const htmlPreview = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1 { text-align: center; margin-bottom: 30px; }
              .firma-area { border: 2px dashed #ccc; height: 100px; margin: 30px 0; display: flex; align-items: center; justify-content: center; color: #999; }
              .fecha { text-align: right; margin: 30px 0; }
              .footer { margin-top: 50px; font-size: 0.9em; color: #666; }
            </style>
          </head>
          <body>
            <h1>${docSeleccionado.nombre}</h1>
            
            <p>En <strong>Santiago de Chile</strong>, a ${new Date().toLocaleDateString()}, por medio del presente documento, 
              <strong>${clienteInfo.nombre}</strong>, RUT ${clienteInfo.rut}, declara y acepta las siguientes condiciones...</p>
            
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet ultricies lacinia, 
              nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc sit amet ultricies lacinia,
              nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
            
            <div class="firma-area" id="firmaArea">
              Área para firma digital
            </div>
            
            <div class="fecha">
              Santiago, ${new Date().toLocaleDateString()}
            </div>
            
            <div class="footer">
              <p>Documento generado por Vecinos NotaryPro - ID: NOT-${Math.floor(100000 + Math.random() * 900000)}</p>
              <p>Verificación en: tuu.cl/verificar</p>
            </div>
          </body>
        </html>
      `;
      
      setDocumentPreview(htmlPreview);
      // Mostrar preview del documento
      setShowPreview(true);
    } else {
      // Si por alguna razón no hay documento seleccionado, mostrar error
      toast({
        title: "Error en el proceso",
        description: "No se ha podido generar la vista previa del documento",
        variant: "destructive",
      });
      setStep('documentos');
    }
  };
  
  // Para el panel de firma
  const iniciarDibujo = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (canvas && ctx) {
      signatureCtxRef.current = ctx;
      ctx.beginPath();
      
      // Obtener las coordenadas correctas según el tipo de evento
      let clientX, clientY;
      
      if ('touches' in e) {
        // Es un evento táctil
        const rect = canvas.getBoundingClientRect();
        clientX = e.touches[0].clientX - rect.left;
        clientY = e.touches[0].clientY - rect.top;
      } else {
        // Es un evento de mouse
        const rect = canvas.getBoundingClientRect();
        clientX = e.clientX - rect.left;
        clientY = e.clientY - rect.top;
      }
      
      ctx.moveTo(clientX, clientY);
    }
  };
  
  const dibujar = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = signatureCtxRef.current;
    
    if (canvas && ctx) {
      // Obtener las coordenadas correctas según el tipo de evento
      let clientX, clientY;
      
      if ('touches' in e) {
        // Es un evento táctil
        e.preventDefault(); // Prevenir el scroll en dispositivos táctiles
        const rect = canvas.getBoundingClientRect();
        clientX = e.touches[0].clientX - rect.left;
        clientY = e.touches[0].clientY - rect.top;
      } else {
        // Es un evento de mouse
        const rect = canvas.getBoundingClientRect();
        clientX = e.clientX - rect.left;
        clientY = e.clientY - rect.top;
      }
      
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      
      ctx.lineTo(clientX, clientY);
      ctx.stroke();
      
      // Preparar para el siguiente segmento
      ctx.beginPath();
      ctx.moveTo(clientX, clientY);
      
      // Guardar la imagen en el estado
      setSignatureImage(canvas.toDataURL());
    }
  };
  
  const terminarDibujo = () => {
    setIsDrawing(false);
  };
  
  const limpiarFirma = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = signatureCtxRef.current;
    
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureImage('');
    }
  };
  
  const iniciarFirma = () => {
    setTimeout(() => {
      const canvas = signatureCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          signatureCtxRef.current = ctx;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, 100);
  };
  
  // Métodos para la verificación de identidad
  // Iniciar lectura NFC específicamente
  const iniciarLecturaNFC = () => {
    setShowNFCReader(true);
    toast({
      title: "Lector NFC activado",
      description: "Acerque la cédula chilena al lector de su dispositivo",
    });
  };

  const iniciarCamara = async () => {
    console.log("Iniciando cámara...");
    setShowCamera(true); // Mostrar modal primero
    
    setTimeout(async () => {
      // Verificar disponibilidad de la cámara
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          console.log("Solicitando permiso de cámara...");
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 } 
            } 
          });
          
          console.log("Permiso de cámara concedido, configurando video...");
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => {
                console.error("Error al reproducir video:", e);
              });
            };
          } else {
            console.error("Referencia de video no disponible");
          }
          
        } catch (err) {
          console.error("Error al acceder a la cámara:", err);
          toast({
            title: "Error al acceder a la cámara",
            description: "No se pudo acceder a la cámara del dispositivo. Verifique los permisos.",
            variant: "destructive",
          });
        }
      } else {
        console.error("API mediaDevices no disponible");
        toast({
          title: "Cámara no disponible",
          description: "Su dispositivo o navegador no soporta acceso a la cámara",
          variant: "destructive",
        });
      }
    }, 500); // Pequeño retraso para asegurar que el modal esté listo
  };
  
  const tomarFoto = () => {
    const video = videoRef.current;
    const canvas = photoRef.current;
    
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Establecer dimensiones del canvas para que coincidan con el video manteniendo la relación de aspecto
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dibujar el frame actual del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Marcar como foto tomada
        setPhotoTaken(true);
        
        // Detener la transmisión de la cámara
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };
  
  // Manejar verificación con NFC
  
  const handleNFCSuccess = (data: CedulaChilenaData) => {
    setCedulaData(data);
    setShowNFCReader(false);
    setIdentityVerified(true);
    
    // Actualizar datos del cliente con la información de la cédula
    setClienteInfo(prevInfo => ({
      ...prevInfo,
      nombre: `${data.nombres} ${data.apellidos}`,
      rut: data.rut
    }));
    
    toast({
      title: "Cédula leída correctamente",
      description: "Se ha verificado la identidad con los datos del chip NFC",
      variant: "default",
    });
  };
  
  const handleNFCCancel = () => {
    setShowNFCReader(false);
    toast({
      title: "Lectura NFC cancelada",
      description: "Se ha cancelado la lectura de la cédula",
      variant: "destructive",
    });
  };

  // Función mejorada para la verificación de identidad
  const verificarIdentidad = () => {
    // Comprobar si ya está verificado
    if (identityVerified) {
      toast({
        title: "Identidad ya verificada",
        description: "El cliente ya ha sido verificado",
        variant: "default",
      });
      return;
    }
    
    // En esta versión mejorada, iniciamos directamente la cámara
    // que es la opción más compatible y probablemente funcione en más dispositivos
    toast({
      title: "Iniciando verificación de identidad",
      description: "Preparando cámara para verificación...",
    });
    
    // Para demostración, implementemos una verificación que siempre funcione
    // Esto nos permite avanzar sin depender de hardware específico
    
    // Iniciar la función de verificación directamente con cámara, que debería ser más confiable
    setTimeout(() => {
      iniciarCamara();
    }, 500);
  };
  
  // Agregamos una función de simulación para pruebas
  const simularVerificacionExitosa = () => {
    setIdentityVerified(true);
    setPhotoTaken(true);
    
    toast({
      title: "Verificación completada",
      description: "La identidad ha sido verificada correctamente (simulación)",
      variant: "default",
    });
    
    if (showCamera) {
      // Cerrar modal de cámara si está abierto
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
    }
  };

  const mostrarPanelCertificador = () => {
    setShowCertifierPanel(true);
  };
  
  // Estado para seguimiento de documentos certificados
  const [documentosCertificados, setDocumentosCertificados] = useState<string[]>([]);
  
  // Componente mejorado para el panel de certificación
  const CertificadorPanel = () => {
    // Estado local para el panel de certificador
    const docSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
    const [documentosEnRevision, setDocumentosEnRevision] = useState([
      {
        id: '123456',
        nombre: docSeleccionado?.nombre || 'Documento sin nombre',
        cliente: clienteInfo.nombre,
        rut: clienteInfo.rut,
        fecha: new Date().toLocaleDateString(),
        estado: 'pendiente'
      }
    ]);
    
    // Función para certificar un documento
    const certificarDocumento = (id: string) => {
      setDocumentosCertificados(prev => [...prev, id]);
      setDocumentosEnRevision(prev => 
        prev.map(doc => doc.id === id ? {...doc, estado: 'certificado'} : doc)
      );
      
      // Mostrar toast de confirmación
      toast({
        title: "Documento certificado",
        description: "El documento ha sido certificado correctamente y está listo para ser enviado al cliente.",
      });
    };
    
    // Función para enviar un documento certificado
    const enviarDocumento = (id: string, metodo: 'email' | 'whatsapp') => {
      toast({
        title: "Documento enviado",
        description: `El documento certificado ha sido enviado al cliente por ${metodo === 'email' ? 'correo electrónico' : 'WhatsApp'}.`,
      });
    };
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Panel de Certificación</h2>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setCertificadorMode(false);
              setShowCertifierPanel(false);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al punto de venta
          </Button>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Columna de documentos pendientes */}
          <Card>
            <CardHeader className="bg-zinc-50 border-b">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Documentos pendientes</CardTitle>
              </div>
              <CardDescription>
                Documentos que requieren certificación por parte de un certificador autorizado
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {documentosEnRevision.filter(doc => doc.estado === 'pendiente').length === 0 ? (
                <div className="bg-zinc-50 p-4 rounded-md border mb-4">
                  <p className="text-zinc-600 text-sm">
                    No hay documentos pendientes de certificación en este momento
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentosEnRevision
                    .filter(doc => doc.estado === 'pendiente')
                    .map(doc => (
                      <div key={doc.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{doc.nombre}</h3>
                            <p className="text-sm text-gray-600 mt-1">Cliente: {doc.cliente}</p>
                            <div className="flex gap-3 text-xs text-gray-500 mt-2">
                              <span>RUT: {doc.rut}</span>
                              <span>Fecha: {doc.fecha}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                              Pendiente
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => certificarDocumento(doc.id)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Certificar
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Columna de documentos certificados */}
          <Card>
            <CardHeader className="bg-zinc-50 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Documentos certificados</CardTitle>
              </div>
              <CardDescription>
                Documentos que han sido certificados y están listos para ser enviados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {documentosEnRevision.filter(doc => doc.estado === 'certificado').length === 0 ? (
                <div className="bg-zinc-50 p-4 rounded-md border mb-4">
                  <p className="text-zinc-600 text-sm">
                    No hay documentos certificados recientemente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentosEnRevision
                    .filter(doc => doc.estado === 'certificado')
                    .map(doc => (
                      <div key={doc.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{doc.nombre}</h3>
                            <p className="text-sm text-gray-600 mt-1">Cliente: {doc.cliente}</p>
                            <div className="flex gap-3 text-xs text-gray-500 mt-2">
                              <span>RUT: {doc.rut}</span>
                              <span>Fecha: {doc.fecha}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Certificado
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Enviar documento:</div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => enviarDocumento(doc.id, 'email')}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => enviarDocumento(doc.id, 'whatsapp')}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Obtener el contenido según el paso actual
  const getPantallaActual = () => {
    switch (step) {
      case 'inicio':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Información del cliente</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input 
                    id="nombre" 
                    value={clienteInfo.nombre}
                    onChange={(e) => setClienteInfo({ ...clienteInfo, nombre: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rut">RUT</Label>
                  <Input 
                    id="rut" 
                    value={clienteInfo.rut}
                    onChange={(e) => setClienteInfo({ ...clienteInfo, rut: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={clienteInfo.email}
                    onChange={(e) => setClienteInfo({ ...clienteInfo, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    type="tel"
                    value={clienteInfo.telefono}
                    onChange={(e) => setClienteInfo({ ...clienteInfo, telefono: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Mensaje informativo sobre disponibilidad de NFC */}
                {nfcAvailable && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                    <div className="mr-3 bg-blue-100 p-2 rounded-full">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-blue-800">Lector NFC disponible</p>
                      <p className="text-blue-700 text-xs">Puede usar el lector NFC para verificar la cédula chilena</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 sm:justify-between">
                  {nfcAvailable && (
                    <Button variant="outline" onClick={iniciarLecturaNFC} className="flex-1 sm:flex-none">
                      <Wallet className="h-4 w-4 mr-2" />
                      Verificar con NFC
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={verificarIdentidad} className="flex-1 sm:flex-none">
                    <Camera className="h-4 w-4 mr-2" />
                    Verificar con cámara
                  </Button>
                  
                  <Button onClick={handleRegistrarCliente} className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar cliente
                  </Button>
                </div>
                
                {/* Opción para simulación */}
                <div className="pt-3 border-t border-dashed border-gray-200">
                  <Button 
                    variant="ghost" 
                    onClick={simularVerificacionExitosa} 
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Simular verificación exitosa (modo demo)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'documentos':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Documentos disponibles</h2>
              <Button variant="outline" onClick={() => setStep('inicio')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documentosDisponibles.map((doc) => (
                <Card 
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSeleccionarDocumento(doc.id)}
                >
                  <CardContent className="p-6">
                    <FileText className="h-8 w-8 text-blue-500 mb-4" />
                    <h3 className="font-bold">{doc.nombre}</h3>
                    <p className="text-sm text-zinc-500 mt-2">
                      Precio: ${doc.precio.toLocaleString()}
                    </p>
                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 'pago':
        const docSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Método de pago</h2>
              <Button variant="outline" onClick={() => setStep('documentos')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{docSeleccionado?.nombre}</h3>
                    <p className="text-zinc-500">Cliente: {clienteInfo.nombre}</p>
                  </div>
                  <div className="text-xl font-bold">
                    ${docSeleccionado?.precio.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card 
                className={`cursor-pointer hover:shadow-md transition-shadow ${metodoPago === 'tarjeta' ? 'border-blue-400 bg-blue-50' : ''}`}
                onClick={() => handleSeleccionarPago('tarjeta')}
              >
                <CardContent className="p-6 flex items-start">
                  <CreditCard className={`h-8 w-8 ${metodoPago === 'tarjeta' ? 'text-blue-500' : 'text-zinc-400'} mr-4`} />
                  <div>
                    <h3 className="font-bold">Tarjeta de crédito/débito</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Pago con tarjeta a través del POS
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'comprobante':
        const documento = documentosDisponibles.find(d => d.id === tipoDocumento);
        
        return (
          <div className="space-y-6">
            <div className="text-center p-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-green-700">¡Proceso completado!</h2>
              <p className="text-zinc-600">El documento ha sido procesado correctamente</p>
            </div>
            
            <Card className="mb-6 overflow-hidden">
              <div className="bg-zinc-100 p-4 border-b">
                <div className="flex justify-between">
                  <h3 className="font-bold">Comprobante de servicio</h3>
                  <span className="text-zinc-500 text-sm">#{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <div className="border-b pb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500">Documento</span>
                      <span className="font-medium">{documento?.nombre}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500">Cliente</span>
                      <span className="font-medium">{clienteInfo.nombre}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500">RUT</span>
                      <span className="font-medium">{clienteInfo.rut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fecha</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500">Método de pago</span>
                      <span className="font-medium">Tarjeta</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-medium">${documento?.precio.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-500">IVA (19%)</span>
                      <span className="font-medium">${Math.round(documento?.precio ? documento.precio * 0.19 : 0).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">${Math.round(documento?.precio ? documento.precio * 1.19 : 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Nuevo panel de certificación y envío */}
            <Card className="mb-6 overflow-hidden border-blue-100">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-bold text-blue-800">Certificación y envío del documento</h3>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Estado de certificación */}
                  <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="mr-3 bg-amber-100 p-2 rounded-full">
                      <ClipboardList className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-800">Pendiente de certificación</h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        El documento será enviado a un certificador para su validación
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={mostrarPanelCertificador}
                      className="ml-2 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      Validar ahora
                    </Button>
                  </div>
                  
                  {/* Opciones de envío */}
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium mb-3">Enviar documento al cliente</h4>
                    
                    <div className="space-y-3">
                      {/* Envío por email */}
                      <div className="flex items-center gap-3">
                        <Input 
                          type="email" 
                          placeholder="Email del cliente" 
                          value={clienteInfo.email} 
                          onChange={(e) => setClienteInfo({ ...clienteInfo, email: e.target.value })}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Documento enviado",
                              description: `Se ha enviado el documento a: ${clienteInfo.email}`,
                            });
                          }}
                          className="whitespace-nowrap"
                        >
                          Enviar por email
                        </Button>
                      </div>
                      
                      {/* Envío por WhatsApp */}
                      <div className="flex items-center gap-3">
                        <Input 
                          type="tel" 
                          placeholder="Teléfono (WhatsApp)" 
                          value={clienteInfo.telefono} 
                          onChange={(e) => setClienteInfo({ ...clienteInfo, telefono: e.target.value })}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Documento enviado",
                              description: `Se ha enviado el documento por WhatsApp a: ${clienteInfo.telefono}`,
                            });
                          }}
                          className="whitespace-nowrap"
                        >
                          Enviar por WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                // Reiniciar completamente el estado para un nuevo cliente/documento
                setStep('inicio');
                setIdentityVerified(false);
                setPhotoTaken(false);
                setClienteInfo({
                  nombre: '',
                  rut: '',
                  email: '',
                  telefono: ''
                });
                setTipoDocumento('');
                setMetodoPago('');
              }}>
                <Home className="h-4 w-4 mr-2" />
                Nuevo proceso
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Paso no reconocido</div>;
    }
  };
  
  const renderContent = () => {
    // Si está cargando, mostrar spinner
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    // Si el socio es certificador, mostrar el panel de certificación
    if (certificadorMode) {
      return <CertificadorPanel />;
    }
    
    return getPantallaActual();
  };
  
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Navbar sencillo */}
      <header className="bg-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FileSignature className="h-7 w-7 text-blue-400 mr-2" />
              <span className="text-white text-lg font-bold">Vecinos NotaryPro</span>
            </div>
          </div>
          
          <div className="flex items-center">
            {partnerInfo && (
              <div className="text-right mr-4">
                <div className="text-blue-400 font-medium text-sm">{partnerInfo.storeName}</div>
                <div className="text-zinc-400 text-xs">{partnerInfo.address}</div>
              </div>
            )}
            
            <button
              onClick={() => {
                // Cerrar sesión
                localStorage.removeItem('vecinos_token');
                setLocation('/vecinos/login');
              }}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 p-2 rounded-md flex items-center text-sm"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Panel principal con estilo NotaryPro */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-6 border border-zinc-300">
          {/* Cabecera con estilo NotaryPro */}
          <div className="mb-5 bg-zinc-800 rounded-md p-3 border-b border-blue-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-1.5 rounded text-white text-xs font-bold shadow-sm">PROCESO</div>
                <div className="flex items-center space-x-2">
                  <div className={`rounded-md h-8 w-8 flex items-center justify-center shadow-sm ${step === 'inicio' ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-700 text-zinc-300'}`}>1</div>
                  <div className={`rounded-md h-8 w-8 flex items-center justify-center shadow-sm ${step === 'documentos' ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-700 text-zinc-300'}`}>2</div>
                  <div className={`rounded-md h-8 w-8 flex items-center justify-center shadow-sm ${step === 'pago' ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-700 text-zinc-300'}`}>3</div>
                  <div className={`rounded-md h-8 w-8 flex items-center justify-center shadow-sm ${step === 'comprobante' ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-700 text-zinc-300'}`}>4</div>
                </div>
              </div>
              
              <div className="bg-zinc-700 p-2 border border-zinc-600 rounded shadow-sm">
                <p className="text-sm font-bold text-white">
                  {step === 'inicio' && 'REGISTRAR CLIENTE'}
                  {step === 'documentos' && 'SELECCIONAR DOCUMENTO'}
                  {step === 'pago' && 'PROCESAR PAGO'}
                  {step === 'comprobante' && 'TICKET DE VENTA'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="p-4">
            {getPantallaActual()}
          </div>
        </div>
      </div>
      
      {/* Modal para ver vista previa del documento */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">Vista previa del documento</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-0 max-h-[70vh] overflow-auto">
              <iframe 
                srcDoc={documentPreview}
                className="w-full h-[70vh]"
                title="Vista previa del documento"
              />
            </div>
            
            <div className="p-4 border-t flex justify-between sticky bottom-0 bg-white z-10">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cerrar
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={verificarIdentidad} disabled={identityVerified}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {identityVerified ? 'Identidad verificada' : (nfcAvailable ? 'Verificar identidad (NFC/Cámara)' : 'Verificar identidad')}
                </Button>
                <Button 
                  onClick={() => {
                    setShowPreview(false);
                    setStep('firmar');
                    setTimeout(iniciarFirma, 500);
                  }}
                  disabled={!identityVerified}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Firmar documento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para lector NFC mejorado */}
      {showNFCReader && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            <div className="p-4 bg-zinc-800 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-blue-400" />
                Lector NFC de Cédula
              </h2>
              <Button variant="ghost" size="icon" onClick={handleNFCCancel} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              {/* Instrucciones con ilustración */}
              <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                  {/* Ilustración visual de cómo colocar la cédula */}
                  <div className="bg-blue-50 w-[200px] h-[120px] rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200 relative">
                    <Wallet className="h-12 w-12 text-blue-300" />
                    <div className="absolute -top-3 right-5 animate-pulse">
                      <div className="bg-blue-400 p-1 rounded-full">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute -bottom-3 left-5 animate-pulse delay-300">
                      <div className="bg-blue-500 p-1 rounded-full">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-3 left-5 animate-pulse delay-150">
                      <div className="bg-blue-600 p-1 rounded-full">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Acerque su cédula al dispositivo</h3>
                <p className="text-gray-600 mb-4">
                  Coloque la cédula chilena (chip electrónico) cerca del lector NFC de su dispositivo.
                  Manténgala quieta hasta que se complete la lectura.
                </p>
              </div>
              
              <div className="space-y-4">
                <NFCIdentityReader
                  onSuccess={handleNFCSuccess}
                  onCancel={handleNFCCancel}
                />
                
                {/* Opciones alternativas */}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowNFCReader(false);
                        iniciarCamara();
                      }} 
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Usar cámara en su lugar
                    </Button>
                    
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setShowNFCReader(false);
                        simularVerificacionExitosa();
                      }}
                      className="flex-1"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Simular verificación exitosa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para captura de identidad con cámara */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <div className="p-4 border-b flex justify-between items-center bg-zinc-800 text-white">
              <h2 className="text-lg font-bold flex items-center">
                <Camera className="h-5 w-5 mr-2 text-blue-400" />
                Verificación de identidad
              </h2>
              <Button variant="ghost" size="icon" onClick={() => {
                // Detener la cámara al cerrar
                const stream = videoRef.current?.srcObject as MediaStream;
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                }
                setShowCamera(false);
              }} className="text-gray-300 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <p className="mb-4 text-gray-600">
                Para verificar la identidad del firmante, necesitamos tomar una foto. 
                Por favor asegúrese de que el rostro sea claramente visible.
              </p>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                {!photoTaken ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto"
                      style={{ maxHeight: '50vh', minHeight: '300px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Guía para la posición de la cara */}
                      <div className="border-2 border-dashed border-blue-400 rounded-full w-40 h-40 opacity-50 flex items-center justify-center">
                        <div className="text-xs text-blue-600 font-medium bg-white px-2 py-1 rounded">
                          Alinear rostro
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <canvas
                    ref={photoRef}
                    className="w-full h-auto"
                    style={{ maxHeight: '50vh', minHeight: '300px' }}
                  />
                )}
                
                {/* Overlay para mostrar cuando la cámara se está inicializando */}
                {!photoTaken && !videoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
                    <div className="text-center">
                      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-2 mx-auto"></div>
                      <p className="text-gray-700">Inicializando cámara...</p>
                      <Button 
                        variant="outline" 
                        onClick={simularVerificacionExitosa}
                        className="mt-4 bg-white border-gray-300"
                      >
                        Simular verificación exitosa
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between">
                <Button variant="outline" onClick={() => {
                  // Detener la cámara
                  const stream = videoRef.current?.srcObject as MediaStream;
                  if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                  }
                  setPhotoTaken(false);
                  setShowCamera(false);
                }}>
                  Cancelar
                </Button>
                
                {!photoTaken ? (
                  <div className="space-x-2">
                    <Button onClick={simularVerificacionExitosa} variant="secondary">
                      <Shield className="h-4 w-4 mr-2" />
                      Simular verificación
                    </Button>
                    
                    <Button onClick={tomarFoto} className="bg-blue-600 hover:bg-blue-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Tomar foto
                    </Button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => {
                      setPhotoTaken(false);
                      iniciarCamara(); // Reiniciar la cámara
                    }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Volver a tomar
                    </Button>
                    <Button onClick={() => {
                      setIdentityVerified(true);
                      setShowCamera(false);
                      toast({
                        title: "Identidad verificada",
                        description: "La identidad del cliente ha sido verificada correctamente",
                        variant: "default",
                      });
                    }} className="bg-green-600 hover:bg-green-700">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Verificar
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Instrucciones adicionales y botón para navegadores que no soporten cámara */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-sm mb-2">¿Problemas con la cámara?</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Si su navegador o dispositivo no soporta acceso a la cámara, puede verificar utilizando la simulación o 
                  acceder desde un dispositivo móvil escaneando un código QR.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={simularVerificacionExitosa}
                  className="w-full mt-2"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar de manera alternativa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Panel de firma digital */}
      {step === 'firmar' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Firma de documento</h2>
              <Button variant="ghost" size="icon" onClick={() => setStep('comprobante')}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <p className="mb-4 text-gray-600">
                Por favor, firme en el área indicada utilizando el mouse o pantalla táctil.
              </p>
              
              <div className="border-2 border-gray-300 rounded-lg mb-4 bg-gray-50">
                <canvas
                  ref={signatureCanvasRef}
                  width={560}
                  height={200}
                  className="w-full h-[200px] touch-none"
                  onMouseDown={iniciarDibujo}
                  onMouseMove={dibujar}
                  onMouseUp={terminarDibujo}
                  onMouseLeave={terminarDibujo}
                  onTouchStart={iniciarDibujo}
                  onTouchMove={dibujar}
                  onTouchEnd={terminarDibujo}
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={limpiarFirma}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar firma
                </Button>
                
                <div className="space-x-2">
                  <Button variant="secondary" onClick={() => setStep('comprobante')}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (signatureImage) {
                        setStep('comprobante');
                        toast({
                          title: "Documento firmado",
                          description: "El documento ha sido firmado correctamente.",
                          variant: "default",
                        });
                        
                        // Si es administrador o certificador, mostrar panel de certificación
                        if (certificadorMode) {
                          mostrarPanelCertificador();
                        }
                      } else {
                        toast({
                          title: "Firma requerida",
                          description: "Por favor firme el documento antes de continuar.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar firma
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Panel de certificador */}
      {showCertifierPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Panel de Certificación</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCertifierPanel(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <Tabs defaultValue="document" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="document">Documento</TabsTrigger>
                  <TabsTrigger value="identity">Identidad</TabsTrigger>
                  <TabsTrigger value="certification">Certificación</TabsTrigger>
                </TabsList>
                
                <TabsContent value="document" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revisión de documento</CardTitle>
                      <CardDescription>
                        Verifique el contenido y validez del documento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h3 className="font-medium mb-2">Documento</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {documentosDisponibles.find(d => d.id === tipoDocumento)?.nombre}
                          </p>
                          
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Firmado por:</span>
                            <span className="text-sm font-medium">{clienteInfo.nombre}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">RUT:</span>
                            <span className="text-sm font-medium">{clienteInfo.rut}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button>Ver documento completo</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="identity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verificación avanzada de identidad</CardTitle>
                      <CardDescription>
                        Confirme la identidad del firmante utilizando verificación biométrica
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border rounded-lg border-green-200 bg-green-50">
                        <div className="flex items-center mb-4">
                          <Shield className="h-5 w-5 text-green-500 mr-2" />
                          <h3 className="font-medium text-green-700">Identidad verificada mediante proceso avanzado</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-1">Verificación biométrica</p>
                            <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                              {photoTaken ? (
                                <canvas
                                  ref={photoRef}
                                  className="w-full h-auto object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <Shield className="h-8 w-8 text-green-500 mb-2" />
                                  <span className="text-xs text-gray-500">Verificación biométrica completada</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-1">Información verificada</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Nombre:</span>
                                <span className="text-xs font-medium">{clienteInfo.nombre}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">RUT:</span>
                                <span className="text-xs font-medium">{clienteInfo.rut}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="certification" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificación del documento</CardTitle>
                      <CardDescription>
                        Utilice su firma electrónica avanzada para certificar el documento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border rounded-lg bg-gray-50 mb-4">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                            <Fingerprint className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">Certificación</p>
                            <p className="text-xs mt-1">e-Token FirmaChile</p>
                            <p className="text-xs text-gray-500">Emisor: E-CERT CHILE</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            setShowCertifierPanel(false);
                            toast({
                              title: "Documento certificado",
                              description: "El documento ha sido certificado con éxito con firma electrónica avanzada.",
                              variant: "default",
                            });
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Certificar documento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAppPOSNFC;