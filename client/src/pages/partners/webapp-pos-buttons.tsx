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
              <UserPlus className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Registrar Cliente</h2>
              <p className="text-gray-500">Ingrese los datos del cliente</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <Label htmlFor="nombre" className="text-base font-medium">Nombre completo</Label>
                <Input id="nombre" placeholder="Ej: Juan Pérez González" className="mt-1 text-lg p-6" />
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <Label htmlFor="rut" className="text-base font-medium">RUT</Label>
                <Input id="rut" placeholder="Ej: 12.345.678-9" className="mt-1 text-lg p-6" />
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <Label htmlFor="email" className="text-base font-medium">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="Ej: juan@ejemplo.cl" className="mt-1 text-lg p-6" />
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <Label htmlFor="telefono" className="text-base font-medium">Teléfono</Label>
                <Input id="telefono" placeholder="Ej: +56 9 1234 5678" className="mt-1 text-lg p-6" />
              </div>
              
              <Button 
                size="lg" 
                className="w-full p-8 text-xl mt-6 flex justify-between items-center"
                onClick={handleRegistrarCliente}
              >
                <span>Continuar</span>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        );
        
      case 'documentos':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Seleccionar Documento</h2>
              <p className="text-gray-500">Toque uno de los documentos disponibles</p>
            </div>
            
            <div className="grid gap-4 max-w-md mx-auto">
              {documentosDisponibles.map((doc) => (
                <Button
                  key={doc.id}
                  variant="outline"
                  className="p-6 h-auto flex justify-between items-center text-left"
                  onClick={() => handleSeleccionarDocumento(doc.id)}
                >
                  <div>
                    <p className="text-lg font-medium">{doc.nombre}</p>
                    <p className="text-sm text-gray-500">Código: {doc.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${doc.precio}</p>
                    <p className="text-xs text-primary">Comisión: ${Math.round(doc.precio * 0.15)}</p>
                  </div>
                </Button>
              ))}
              
              <Button 
                variant="ghost" 
                className="mt-4" 
                onClick={() => setStep('inicio')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>
        );
        
      case 'pago':
        const documentoSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Procesar Pago</h2>
              <p className="text-gray-500">Seleccione el método de pago</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-gray-50 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Resumen del documento</h3>
                <div className="flex justify-between mb-2">
                  <span>Documento:</span>
                  <span className="font-medium">{documentoSeleccionado?.nombre}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Precio:</span>
                  <span className="font-medium">${documentoSeleccionado?.precio}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Su comisión:</span>
                  <span className="font-medium text-primary">${Math.round((documentoSeleccionado?.precio || 0) * 0.15)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Método de pago</h3>
                
                <Button 
                  size="lg"
                  className="w-full p-8 text-xl flex justify-between items-center"
                  onClick={() => handleSeleccionarPago('tarjeta')}
                >
                  <div className="flex items-center">
                    <CreditCard className="mr-3 h-6 w-6" />
                    <span>PAGO CON TARJETA</span>
                  </div>
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="mt-4" 
                  onClick={() => setStep('documentos')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'comprobante':
        const docFinal = documentosDisponibles.find(d => d.id === tipoDocumento);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">¡Pago procesado con éxito!</h2>
              <p className="text-gray-500">Documento registrado y enviado al cliente</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-medium text-center mb-4">Comprobante de pago</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Código:</span>
                    <span className="font-medium">VEC-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Documento:</span>
                    <span className="font-medium">{docFinal?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monto:</span>
                    <span className="font-medium">${docFinal?.precio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Método pago:</span>
                    <span className="font-medium">{metodoPago.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha y hora:</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <Button 
                    className="w-full flex justify-center items-center"
                    onClick={imprimirComprobante}
                  >
                    <Printer className="mr-2 h-5 w-5" />
                    Imprimir comprobante
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-center items-center"
                    onClick={() => setShowPreview(true)}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Ver documento
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="ghost" 
                  className="flex items-center"
                  onClick={() => {
                    setIdentityVerified(false);
                    setPhotoTaken(false);
                    setSignatureImage('');
                    setStep('inicio');
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Nuevo cliente
                </Button>
                
                <Button 
                  variant="default"
                  onClick={() => setProcesoCompletado(true)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Finalizar
                </Button>
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
      {/* Header estilo almacén */}
      <div className="bg-yellow-500 text-black shadow-lg border-b-4 border-yellow-600">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-1.5 rounded-md shadow-md border border-yellow-600">
                <h1 className="text-xl font-extrabold">VECINOS <span className="text-blue-600">XPRESS</span></h1>
              </div>
              <div className="ml-3 bg-red-600 text-white px-2 py-0.5 text-xs font-bold rounded">SISTEMA POS v1.3.1</div>
            </div>
            
            <div className="text-right bg-white px-3 py-1 rounded-md shadow border border-yellow-600">
              <p className="text-sm font-bold">ALMACÉN DON PEDRO</p>
              <p className="text-xs bg-blue-600 text-white px-1 rounded inline-block">LOCAL-XP125</p>
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