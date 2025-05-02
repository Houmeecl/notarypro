import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, ArrowLeft, CheckCircle2, Printer, UserPlus, FileText, 
  CreditCard, ChevronRight, FileSignature, UserCheck, Shield, 
  Camera, RefreshCw, Download, X, Fingerprint
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const WebAppPOSButtons = () => {
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
  
  // Referencias para el canvas de firma
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Para la captura de foto de identidad
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  
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
    setStep('documentos');
  };
  
  const handleSeleccionarDocumento = (docId: string) => {
    setTipoDocumento(docId);
    setStep('pago');
  };
  
  const handleSeleccionarPago = (metodo: string) => {
    setMetodoPago(metodo);
    
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
    }
    
    // Continuar al comprobante directamente (en un caso real, aquí se procesaría el pago)
    setStep('comprobante');
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
  const iniciarCamara = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setShowCamera(true);
      } catch (err) {
        toast({
          title: "Error al acceder a la cámara",
          description: "No se pudo acceder a la cámara del dispositivo",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cámara no disponible",
        description: "Su dispositivo no tiene cámara o no está disponible",
        variant: "destructive",
      });
    }
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
  
  const verificarIdentidad = () => {
    // Generar un ID de sesión único para la verificación
    const sessionId = `verify-pos-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Crear una URL para la verificación móvil
    const verificationUrl = `${window.location.origin}/verificacion-identidad-movil?session=${sessionId}`;
    
    // Crear un código QR para la verificación (simulado, en producción usaríamos una biblioteca real)
    const generarQR = () => {
      // En una implementación completa, usaríamos una biblioteca como qrcode
      // En este caso, mostramos cómo se vería con un diálogo
      const confirmed = window.confirm(
        `Se ha generado un código QR con la URL: ${verificationUrl}\n\n` +
        `Escanee este código con su teléfono móvil para completar la verificación.\n\n` +
        `¿Desea simular una verificación exitosa?`
      );
      
      if (confirmed) {
        // Simulamos una verificación exitosa
        setIdentityVerified(true);
        setShowCamera(false);
        
        toast({
          title: "Identidad verificada",
          description: "La identidad del cliente ha sido verificada mediante el proceso avanzado",
          variant: "default",
        });
      }
    };
    
    // Si estamos en un dispositivo móvil, podemos usar la cámara
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      if (photoTaken) {
        // Si ya tenemos una foto, verificar directamente
        setIdentityVerified(true);
        setShowCamera(false);
        
        toast({
          title: "Identidad verificada",
          description: "La identidad del cliente ha sido verificada correctamente",
          variant: "default",
        });
      } else {
        // Si no tenemos foto, ofrecer opciones
        const useQR = window.confirm(
          "¿Desea utilizar verificación avanzada con código QR? " +
          "Esto permitirá al cliente usar su propio dispositivo para la verificación."
        );
        
        if (useQR) {
          generarQR();
        } else {
          // Continuar con el método básico por cámara
          setIdentityVerified(true);
          setShowCamera(false);
          
          toast({
            title: "Identidad verificada",
            description: "La identidad del cliente ha sido verificada correctamente",
            variant: "default",
          });
        }
      }
    } else {
      // Si no hay cámara disponible, siempre usar el código QR
      generarQR();
    }
  };
  
  const mostrarPanelCertificador = () => {
    setShowCertifierPanel(true);
    setCertificadorMode(true);
  };
  
  const imprimirComprobante = () => {
    // Obtener el contenido del comprobante
    const docFinal = documentosDisponibles.find(d => d.id === tipoDocumento);
    const codigoComprobante = `VEC-${Math.floor(100000 + Math.random() * 900000)}`;
    const fechaHora = new Date().toLocaleString();
    
    // Crear contenido HTML para imprimir
    const contenidoImpresion = `
      <html>
        <head>
          <title>Comprobante de Pago - Vecinos NotaryPro</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .comprobante { max-width: 300px; margin: 0 auto; border: 1px solid #ddd; padding: 15px; }
            .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .footer { text-align: center; font-size: 12px; margin-top: 20px; border-top: 1px solid #f0f0f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <h3>Vecinos NotaryPro</h3>
              <p>Comprobante de Pago</p>
            </div>
            
            <div class="item">
              <span>Código:</span>
              <span>${codigoComprobante}</span>
            </div>
            <div class="item">
              <span>Documento:</span>
              <span>${docFinal?.nombre}</span>
            </div>
            <div class="item">
              <span>Monto:</span>
              <span>$${docFinal?.precio}</span>
            </div>
            <div class="item">
              <span>Método pago:</span>
              <span>${metodoPago.toUpperCase()}</span>
            </div>
            <div class="item">
              <span>Fecha y hora:</span>
              <span>${fechaHora}</span>
            </div>
            
            <div class="footer">
              <p>El documento ha sido enviado al correo del cliente.</p>
              <p>Gracias por utilizar Vecinos NotaryPro.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      // Esperar a que cargue el contenido y luego imprimir
      setTimeout(() => {
        ventanaImpresion.print();
        // Cerrar la ventana después de imprimir (o cancelar)
        ventanaImpresion.close();
      }, 500);
    }
  };

  const getPantallaActual = () => {
    switch(step) {
      case 'inicio':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              {/* Icono con animación suave */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
                <div className="absolute inset-2 bg-blue-200 rounded-full animate-pulse opacity-70 delay-75"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <UserPlus className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-blue-800">Registrar Cliente</h2>
              <p className="text-gray-500 max-w-md mx-auto">Complete los campos a continuación o escanee un código QR para autocompletar</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              {/* Formulario con indicadores visuales */}
              <div className="grid grid-cols-12 gap-4">
                {/* Nombre con icono */}
                <div className="col-span-12 bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transition-all hover:shadow-lg">
                  <div className="flex">
                    <div className="bg-blue-50 p-4 flex items-center justify-center border-r border-blue-100">
                      <div className="text-blue-600 rounded-full p-1">👤</div>
                    </div>
                    <div className="flex-1 p-3">
                      <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">Nombre completo</Label>
                      <Input 
                        id="nombre" 
                        placeholder="Ej: Juan Pérez González" 
                        className="mt-1 border-0 p-2 text-lg focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* RUT con icono */}
                <div className="col-span-12 sm:col-span-6 bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transition-all hover:shadow-lg">
                  <div className="flex">
                    <div className="bg-blue-50 p-4 flex items-center justify-center border-r border-blue-100">
                      <div className="text-blue-600 rounded-full p-1">🆔</div>
                    </div>
                    <div className="flex-1 p-3">
                      <Label htmlFor="rut" className="text-sm font-medium text-gray-700">RUT</Label>
                      <Input 
                        id="rut" 
                        placeholder="Ej: 12.345.678-9" 
                        className="mt-1 border-0 p-2 text-lg focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Teléfono con icono */}
                <div className="col-span-12 sm:col-span-6 bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transition-all hover:shadow-lg">
                  <div className="flex">
                    <div className="bg-blue-50 p-4 flex items-center justify-center border-r border-blue-100">
                      <div className="text-blue-600 rounded-full p-1">📱</div>
                    </div>
                    <div className="flex-1 p-3">
                      <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono</Label>
                      <Input 
                        id="telefono" 
                        placeholder="Ej: +56 9 1234 5678" 
                        className="mt-1 border-0 p-2 text-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Email con icono */}
                <div className="col-span-12 bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transition-all hover:shadow-lg">
                  <div className="flex">
                    <div className="bg-blue-50 p-4 flex items-center justify-center border-r border-blue-100">
                      <div className="text-blue-600 rounded-full p-1">✉️</div>
                    </div>
                    <div className="flex-1 p-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Ej: juan@ejemplo.cl" 
                        className="mt-1 border-0 p-2 text-lg focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Opciones rápidas */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button variant="outline" className="p-2 h-auto text-xs flex flex-col items-center">
                  <div className="bg-yellow-100 rounded-full p-1 mb-1">📷</div>
                  <span>Escanear CI</span>
                </Button>
                <Button variant="outline" className="p-2 h-auto text-xs flex flex-col items-center">
                  <div className="bg-green-100 rounded-full p-1 mb-1">🔄</div>
                  <span>Cliente habitual</span>
                </Button>
                <Button variant="outline" className="p-2 h-auto text-xs flex flex-col items-center">
                  <div className="bg-red-100 rounded-full p-1 mb-1">🧹</div>
                  <span>Limpiar datos</span>
                </Button>
              </div>
              
              {/* Botón con diseño moderno y animación */}
              <button 
                onClick={handleRegistrarCliente}
                className="w-full mt-6 p-0 bg-transparent border-0 relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-purple-600 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-blue-200/50 hover:shadow-xl overflow-hidden">
                  <div className="absolute right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
                  <div className="absolute left-0 w-16 h-16 bg-white/10 rounded-full translate-x-3 translate-y-6 group-hover:translate-y-12 transition-transform duration-500"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="bg-white bg-opacity-20 p-2 rounded-xl mr-3 shadow-inner">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">Registrar Cliente</span>
                  </div>
                  
                  <div className="relative z-10 flex items-center space-x-1">
                    <span className="text-xs font-medium text-blue-100 opacity-0 group-hover:opacity-100 transition-opacity">CONTINUAR</span>
                    <div className="p-1 rounded-full bg-white/20">
                      <ChevronRight className="h-6 w-6 transform transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );
        
      case 'documentos':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              {/* Icono animado de documentos */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-50"></div>
                <div className="absolute inset-2 bg-yellow-200 rounded-full animate-pulse opacity-70 delay-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-yellow-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-yellow-700">Seleccionar Documento</h2>
              <p className="text-gray-500 max-w-md mx-auto">Elija el tipo de documento que necesita procesar</p>
              
              {/* Barra de búsqueda rápida */}
              <div className="mt-4 max-w-md mx-auto relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input 
                  type="text"
                  placeholder="Buscar documento..."
                  className="pl-10 bg-white shadow-sm focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            
            {/* Grid de documentos con categorías */}
            <div className="max-w-3xl mx-auto">
              {/* Categorías de documentos */}
              <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide gap-2">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-blue-200 shadow-sm">
                  Todos
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 shadow-sm">
                  Contratos
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 shadow-sm">
                  Declaraciones
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 shadow-sm">
                  Autorizaciones
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 shadow-sm">
                  Laborales
                </div>
              </div>
              
              {/* Documentos en formato tarjeta interactiva */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentosDisponibles.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => handleSeleccionarDocumento(doc.id)}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg border border-gray-200 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:border-yellow-300 group"
                  >
                    <div className="p-1 bg-gradient-to-r from-yellow-400 to-yellow-300">
                      <div className="h-1"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                            {doc.id === 'contrato' && <div className="text-xl">📄</div>}
                            {doc.id === 'declaracion' && <div className="text-xl">📝</div>}
                            {doc.id === 'autorizacion' && <div className="text-xl">✅</div>}
                            {doc.id === 'finiquito' && <div className="text-xl">📋</div>}
                            {doc.id === 'compraventa' && <div className="text-xl">🔄</div>}
                            {doc.id === 'arriendo' && <div className="text-xl">🏠</div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{doc.nombre}</h3>
                            <div className="text-xs text-gray-500 mt-1">COD: {doc.id.toUpperCase()}</div>
                          </div>
                        </div>
                        <div className="bg-yellow-500 text-white font-bold rounded-full py-1 px-3 text-sm">
                          ${doc.precio}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                            Comisión: ${Math.round(doc.precio * 0.15)}
                          </div>
                        </div>
                        
                        <div className="text-gray-400 group-hover:text-yellow-500 transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline"
                className="mt-6 border-2 border-gray-300 hover:bg-gray-100 transition-colors" 
                onClick={() => setStep('inicio')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a datos del cliente
              </Button>
            </div>
          </div>
        );
        
      case 'pago':
        const documentoSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              {/* Icono animado de pagos */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse opacity-50"></div>
                <div className="absolute inset-2 bg-green-200 rounded-full animate-pulse opacity-70 delay-150"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-700">Procesar Pago</h2>
              <p className="text-gray-500 max-w-md mx-auto">El pago se procesará de forma segura</p>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Tarjeta de resumen con estilo de factura */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
                <div className="bg-green-600 p-3 text-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Resumen del Pedido</h3>
                    <div className="bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                      VECINOS XPRESS
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center mb-4">
                      <div className="p-1.5 bg-green-100 rounded mr-3">
                        {documentoSeleccionado?.id === 'contrato' && <div className="text-xl">📄</div>}
                        {documentoSeleccionado?.id === 'declaracion' && <div className="text-xl">📝</div>}
                        {documentoSeleccionado?.id === 'autorizacion' && <div className="text-xl">✅</div>}
                        {documentoSeleccionado?.id === 'finiquito' && <div className="text-xl">📋</div>}
                        {documentoSeleccionado?.id === 'compraventa' && <div className="text-xl">🔄</div>}
                        {documentoSeleccionado?.id === 'arriendo' && <div className="text-xl">🏠</div>}
                      </div>
                      <div>
                        <h4 className="font-bold">{documentoSeleccionado?.nombre}</h4>
                        <p className="text-xs text-gray-500">Código: {documentoSeleccionado?.id.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="ml-2 pl-6 border-l-2 border-green-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium">{clienteInfo.nombre}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">RUT:</span>
                        <span className="font-medium">{clienteInfo.rut}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${documentoSeleccionado?.precio}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA (19%):</span>
                      <span className="font-medium">Incluido</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                      <span>Total:</span>
                      <span className="text-green-600">${documentoSeleccionado?.precio}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs bg-yellow-50 p-2 rounded mt-3">
                      <span className="text-yellow-800">Su comisión:</span>
                      <span className="font-bold text-yellow-800">${Math.round((documentoSeleccionado?.precio || 0) * 0.15)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Métodos de pago */}
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <div className="p-1.5 bg-blue-100 rounded-full mr-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Método de pago
                </h3>
                
                {/* Métodos de pago con tarjeta - diseño moderno */}
                <div 
                  onClick={() => handleSeleccionarPago('tarjeta')}
                  className="relative bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-0.5 mb-3 cursor-pointer overflow-hidden group"
                >
                  {/* Borde animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  
                  {/* Contenido */}
                  <div className="relative bg-white rounded-xl p-4 z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          {/* Círculo con tarjeta animada */}
                          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-300/50 transition-shadow">
                            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center group-hover:scale-90 transition-transform duration-300">
                              <CreditCard className="h-7 w-7 text-blue-600" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-bold text-blue-800 text-lg">Tarjeta de Crédito/Débito</p>
                          <div className="flex items-center mt-1">
                            <div className="flex mr-2 space-x-1">
                              <div className="h-5 w-8 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-sm"></div>
                              <div className="h-5 w-8 rounded bg-gradient-to-r from-red-500 to-red-600 shadow-sm"></div>
                              <div className="h-5 w-8 rounded bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
                            </div>
                            <p className="text-xs text-blue-600 font-medium">Pago seguro con encriptación SSL</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 border-2 border-transparent group-hover:border-blue-500 transition-colors">
                          <ChevronRight className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="mt-1 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          SELECCIONAR
                        </div>
                      </div>
                    </div>
                    
                    {/* Información de seguridad */}
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center group-hover:text-blue-600 transition-colors">
                      <div className="w-4 h-4 mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      Tu información está protegida con los más altos estándares de seguridad
                    </div>
                  </div>
                </div>
                
                {/* Navegación moderna */}
                <div className="flex justify-between mt-6">
                  {/* Botón volver con efecto */}
                  <button 
                    onClick={() => setStep('documentos')}
                    className="relative group overflow-hidden rounded-xl border-0 p-0 bg-transparent"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center px-4 py-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      <ArrowLeft className="mr-2 h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Volver</span>
                    </div>
                  </button>
                  
                  {/* Botón principal con efecto neomorfismo */}
                  <button
                    onClick={() => handleSeleccionarPago('tarjeta')}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="relative flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-medium shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                      <span className="mr-2">Procesar Pago</span>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'comprobante':
        const docFinal = documentosDisponibles.find(d => d.id === tipoDocumento);
        const codigoComprobante = `VEC-${Math.floor(100000 + Math.random() * 900000)}`;
        
        return (
          <div className="space-y-6">
            {/* Animación de éxito con confeti visual */}
            <div className="text-center mb-6 relative">
              <div className="absolute inset-0 flex justify-center">
                <div className="relative w-32 h-32">
                  {/* Círculos animados que simulan un confeti simple */}
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-full w-2 h-2 opacity-70 animate-ping`}
                      style={{
                        backgroundColor: ['#34D399', '#60A5FA', '#F59E0B', '#EC4899'][i % 4],
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${1 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse opacity-40"></div>
                <div className="absolute inset-3 bg-green-200 rounded-full animate-pulse opacity-60 delay-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-700">¡Operación exitosa!</h2>
              <p className="text-gray-600 max-w-md mx-auto">El documento ha sido procesado y enviado al correo del cliente</p>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Ticket estilo comprobante de compra */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative mb-8">
                {/* Borde superior estilo ticket */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-green-500 to-green-400"></div>
                
                {/* Cabecera del ticket */}
                <div className="pt-6 pb-4 px-6 text-center border-b border-dashed border-gray-200">
                  <div className="font-bold text-xl text-gray-800 mb-1">VECINOS XPRESS</div>
                  <div className="text-sm text-gray-600">Comprobante de Documento Digital</div>
                  <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                    PAGO APROBADO
                  </div>
                </div>
                
                {/* Contenido del ticket */}
                <div className="px-6 py-4">
                  {/* Datos del documento y transacción */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="p-1.5 bg-green-100 rounded mr-3">
                        {docFinal?.id === 'contrato' && <div className="text-xl">📄</div>}
                        {docFinal?.id === 'declaracion' && <div className="text-xl">📝</div>}
                        {docFinal?.id === 'autorizacion' && <div className="text-xl">✅</div>}
                        {docFinal?.id === 'finiquito' && <div className="text-xl">📋</div>}
                        {docFinal?.id === 'compraventa' && <div className="text-xl">🔄</div>}
                        {docFinal?.id === 'arriendo' && <div className="text-xl">🏠</div>}
                      </div>
                      <h3 className="font-bold text-lg">{docFinal?.nombre}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 mb-1">Cliente</div>
                        <div className="font-medium">{clienteInfo.nombre}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 mb-1">RUT</div>
                        <div className="font-medium">{clienteInfo.rut}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Código:</span>
                        <span className="font-medium font-mono">{codigoComprobante}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hora:</span>
                        <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className="font-medium">{metodoPago === 'tarjeta' ? 'Tarjeta' : metodoPago.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-gray-100">
                        <span>Total pagado:</span>
                        <span className="text-green-600">${docFinal?.precio}</span>
                      </div>
                      <div className="flex justify-between text-xs bg-yellow-50 p-2 rounded mt-1">
                        <span className="text-yellow-800">Su comisión:</span>
                        <span className="font-bold text-yellow-800">${Math.round((docFinal?.precio || 0) * 0.15)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR code placeholder */}
                  <div className="flex flex-col items-center mt-4 mb-2 pt-3 border-t border-dashed border-gray-200">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400">
                      QR Code
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Escanee para verificar la autenticidad del documento
                    </div>
                  </div>
                  
                  {/* Botones de acción modernos */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {/* Botón de impresión con efecto de glassmorphism */}
                    <button 
                      onClick={imprimirComprobante}
                      className="relative group overflow-hidden rounded-xl p-0 border-0 bg-transparent"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-xl"></div>
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 group-hover:bg-white/60 transition-all duration-300"></div>
                      <div className="relative flex items-center justify-center py-2.5 px-3">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-20 blur-sm rounded-xl transition-opacity duration-300"></div>
                        <div className="mr-1.5 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                          <Printer className="h-4 w-4 text-green-700" />
                        </div>
                        <span className="font-medium text-green-800">Imprimir</span>
                      </div>
                    </button>
                    
                    {/* Botón de vista previa con efecto de glassmorphism */}
                    <button 
                      onClick={() => setShowPreview(true)}
                      className="relative group overflow-hidden rounded-xl p-0 border-0 bg-transparent"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-xl"></div>
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 group-hover:bg-white/60 transition-all duration-300"></div>
                      <div className="relative flex items-center justify-center py-2.5 px-3">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 blur-sm rounded-xl transition-opacity duration-300"></div>
                        <div className="mr-1.5 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <FileText className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="font-medium text-blue-800">Ver documento</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Pie del ticket con estilo mejorado */}
                <div className="py-3 px-6 bg-gradient-to-r from-gray-50 to-gray-100 text-center text-xs text-gray-500 border-t border-dashed border-gray-200">
                  <p className="font-medium">Gracias por usar Vecinos NotaryPro Xpress</p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="h-0.5 w-10 bg-gray-200 rounded-full mr-2"></div>
                    <p className="text-gray-600">Documento verificable en <span className="text-blue-600 font-medium">www.tuu.cl/verificar</span></p>
                    <div className="h-0.5 w-10 bg-gray-200 rounded-full ml-2"></div>
                  </div>
                </div>
                
                {/* Borde inferior estilo ticket */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-green-400 to-green-500"></div>
              </div>
              
              {/* Botones de navegación modernos */}
              <div className="flex justify-between mt-6">
                {/* Botón nuevo cliente con efecto de brillo */}
                <button 
                  onClick={() => {
                    setIdentityVerified(false);
                    setPhotoTaken(false);
                    setSignatureImage('');
                    setStep('inicio');
                  }}
                  className="relative group overflow-hidden rounded-xl bg-transparent p-0 border-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center px-4 py-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                    <div className="absolute -inset-px bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 group-hover:bg-blue-100 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Nuevo cliente</span>
                    </div>
                  </div>
                </button>
                
                {/* Botón finalizar con efecto 3D */}
                <button 
                  onClick={() => setProcesoCompletado(true)}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative flex items-center px-5 py-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white font-medium shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 flex justify-center">
                      <div className="w-12 h-32 bg-white/10 rotate-12 transform translate-x-12 -translate-y-2 group-hover:translate-x-40 transition-all duration-1000 ease-out"></div>
                    </div>
                    <div className="absolute top-0 right-0 h-2 w-full bg-gradient-to-l from-white/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-white/20 to-transparent"></div>
                    <div className="relative flex items-center">
                      <Check className="mr-2 h-5 w-5" />
                      <span>Finalizar trámite</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-100 min-h-screen">
      {/* Header estilo almacén con elementos gráficos mejorados */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg border-b-4 border-yellow-600">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-md shadow-md border-2 border-yellow-600 relative overflow-hidden">
                {/* Estilo gráfico tipo etiqueta de precio */}
                <div className="absolute -right-8 -top-8 w-16 h-16 bg-red-600 rotate-45"></div>
                <h1 className="text-xl font-black relative z-10">
                  VECINOS <span className="text-blue-600">XPRESS</span>
                </h1>
                <div className="h-1 w-3/4 bg-gradient-to-r from-blue-500 to-green-500 mt-1"></div>
              </div>
              <div className="ml-3 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full flex items-center border-2 border-white shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                SISTEMA POS v1.3.1
              </div>
            </div>
            
            <div className="relative">
              {/* Estilo tarjeta identificativa comercio */}
              <div className="text-right bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-600 relative overflow-hidden">
                {/* Patrón gráfico en el fondo */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-10 grid-rows-5 gap-1 h-full">
                    {Array(50).fill(0).map((_, i) => (
                      <div key={i} className="bg-blue-600 rounded-sm"></div>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-black relative z-10">ALMACÉN DON PEDRO</p>
                <div className="flex items-center justify-end mt-1">
                  <div className="flex items-center bg-green-100 px-2 py-0.5 rounded-full border border-green-300 mr-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-800 font-medium">ACTIVO</span>
                  </div>
                  <div className="bg-blue-600 text-white px-2 py-0.5 text-xs font-bold rounded-full border border-blue-300 shadow-sm">
                    LOCAL-XP125
                  </div>
                </div>
              </div>
              
              {/* Etiqueta colgante estilo almacén */}
              <div className="absolute -right-2 -top-3 w-8 h-10 bg-red-500 rounded-t-lg flex justify-center items-center shadow-md transform rotate-12">
                <div className="w-2 h-2 rounded-full bg-white border border-red-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/partners/sdk-demo')}
              className="border-2 border-gray-400 hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 border border-green-600 px-3 py-1 rounded-md flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-bold text-green-800">SISTEMA ACTIVO</span>
            </div>
            
            <div className="bg-blue-100 border border-blue-500 px-3 py-1 rounded-md">
              <span className="text-sm font-bold text-blue-800">COMISIÓN: $27.500</span>
            </div>
          </div>
        </div>
        
        {/* Panel principal con borde reforzado estilo almacén */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-6 border-2 border-gray-300">
          {/* Cabecera estilo etiqueta de supermercado */}
          <div className="mb-5 bg-yellow-100 rounded-md p-2 border-y-2 border-yellow-400">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-1 rounded text-white text-xs font-bold">PROCESO</div>
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center shadow-sm ${step === 'inicio' ? 'bg-yellow-500 text-white font-bold' : 'bg-gray-200'}`}>1</div>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center shadow-sm ${step === 'documentos' ? 'bg-yellow-500 text-white font-bold' : 'bg-gray-200'}`}>2</div>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center shadow-sm ${step === 'pago' ? 'bg-yellow-500 text-white font-bold' : 'bg-gray-200'}`}>3</div>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center shadow-sm ${step === 'comprobante' ? 'bg-yellow-500 text-white font-bold' : 'bg-gray-200'}`}>4</div>
                </div>
              </div>
              
              <div className="bg-white p-1 border border-gray-300 rounded shadow-sm">
                <p className="text-sm font-bold text-blue-800">
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
                <Button variant="outline" onClick={iniciarCamara} disabled={identityVerified}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {identityVerified ? 'Identidad verificada' : 'Verificar identidad'}
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
      
      {/* Modal para captura de identidad con cámara */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Verificación de identidad</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCamera(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <p className="mb-4 text-gray-600">
                Para verificar la identidad del firmante, necesitamos tomar una foto. 
                Por favor asegúrese de que el rostro sea claramente visible.
              </p>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                {!photoTaken ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-full h-auto"
                    style={{ maxHeight: '50vh' }}
                  />
                ) : (
                  <canvas
                    ref={photoRef}
                    className="w-full h-auto"
                    style={{ maxHeight: '50vh' }}
                  />
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setPhotoTaken(false);
                  setShowCamera(false);
                }}>
                  Cancelar
                </Button>
                
                {!photoTaken ? (
                  <Button onClick={tomarFoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    Tomar foto
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setPhotoTaken(false)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Volver a tomar
                    </Button>
                    <Button onClick={verificarIdentidad}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Verificar
                    </Button>
                  </div>
                )}
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
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Documento:</span>
                                <span className="text-xs font-medium">Válido</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Verificación facial:</span>
                                <span className="text-xs font-medium text-green-600">Completada</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Prueba de vida:</span>
                                <span className="text-xs font-medium text-green-600">Validada</span>
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
                      <CardTitle>Emitir Certificación</CardTitle>
                      <CardDescription>
                        Complete el proceso de certificación del documento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h3 className="font-medium mb-3">Estado de requisitos</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${signatureImage ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                {signatureImage && <Check className="h-3 w-3" />}
                              </div>
                              <span className={signatureImage ? 'text-green-700' : 'text-gray-500'}>
                                Firma del documento
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${identityVerified ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                {identityVerified && <Check className="h-3 w-3" />}
                              </div>
                              <span className={identityVerified ? 'text-green-700' : 'text-gray-500'}>
                                Verificación de identidad
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${true ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-green-700">
                                Pago procesado
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <h3 className="font-medium mb-3 flex items-center">
                            <Fingerprint className="h-5 w-5 mr-2 text-blue-600" />
                            Firma electrónica avanzada de certificador
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Como certificador, debe agregar su firma electrónica avanzada para validar este documento
                            con pleno valor legal según la Ley 19.799.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-3 border rounded">
                                <p className="text-sm font-medium">Certificador</p>
                                <p className="text-xs mt-1">José Rodríguez Fernández</p>
                                <p className="text-xs text-gray-500">Certificador Autorizado</p>
                              </div>
                              
                              <div className="bg-white p-3 border rounded">
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
                        </div>
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

export default WebAppPOSButtons;