import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, ArrowLeft, CheckCircle2, Printer, UserPlus, FileText, 
  CreditCard, ChevronRight, FileSignature, UserCheck, Shield, 
  Camera, RefreshCw, Download, X
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
  const [metodoPago, setMetodoPago] = useState('');
  const [procesoCompletado, setProcesoCompletado] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showCertifierPanel, setShowCertifierPanel] = useState(false);
  const [signatureImage, setSignatureImage] = useState('');
  const [certificadorMode, setCertificadorMode] = useState(false);
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
  const [clienteInfo, setClienteInfo] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: ''
  });
  
  const documentosDisponibles = [
    { id: "doc1", nombre: "Declaración Jurada Simple", precio: 3500 },
    { id: "doc2", nombre: "Poder Especial", precio: 4500 },
    { id: "doc3", nombre: "Contrato de Arriendo", precio: 5500 },
    { id: "doc4", nombre: "Contrato de Compraventa", precio: 6500 },
    { id: "doc5", nombre: "Finiquito Laboral", precio: 4000 },
  ];

  const handleRegistrarCliente = () => {
    setStep('documentos');
  };

  const handleSeleccionarDocumento = (id: string) => {
    setTipoDocumento(id);
    setStep('pago');
  };

  const handleSeleccionarPago = (tipo: string) => {
    setMetodoPago(tipo);
    setProcesoCompletado(true);
    setStep('comprobante');
  };

  const reiniciarProceso = () => {
    setTipoDocumento('');
    setMetodoPago('');
    setProcesoCompletado(false);
    setStep('inicio');
    setShowPreview(false);
    setIdentityVerified(false);
    setShowCertifierPanel(false);
    setSignatureImage('');
    setPhotoTaken(false);
    setShowCamera(false);
    setDocumentPreview('');
  };
  
  // Función para mostrar la vista previa del documento
  const mostrarVistaPrevia = () => {
    const documentoSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
    if (!documentoSeleccionado) return;
    
    // Construir HTML de vista previa
    const previewHTML = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .document { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .field { display: flex; margin-bottom: 10px; }
            .field-label { font-weight: bold; width: 200px; }
            .signature-area { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            .signature-box { border: 1px dashed #ccc; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              <div class="title">${documentoSeleccionado.nombre}</div>
              <div class="subtitle">Documento generado por Vecinos NotaryPro</div>
            </div>
            
            <div class="section">
              <div class="section-title">Información General</div>
              <div class="field">
                <div class="field-label">Tipo de documento:</div>
                <div>${documentoSeleccionado.nombre}</div>
              </div>
              <div class="field">
                <div class="field-label">Código:</div>
                <div>DOC-${Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
              <div class="field">
                <div class="field-label">Fecha:</div>
                <div>${new Date().toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Datos del Cliente</div>
              <div class="field">
                <div class="field-label">Nombre:</div>
                <div>${document.getElementById('nombre')?.value || 'Juan Pérez González'}</div>
              </div>
              <div class="field">
                <div class="field-label">RUT:</div>
                <div>${document.getElementById('rut')?.value || '12.345.678-9'}</div>
              </div>
              <div class="field">
                <div class="field-label">Email:</div>
                <div>${document.getElementById('email')?.value || 'juan@ejemplo.cl'}</div>
              </div>
              <div class="field">
                <div class="field-label">Teléfono:</div>
                <div>${document.getElementById('telefono')?.value || '+56 9 1234 5678'}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Contenido del Documento</div>
              <p>Este ${documentoSeleccionado.nombre} se genera de conformidad con las leyes de la República de Chile y tiene plena validez legal.</p>
              <p>El firmante declara bajo juramento que toda la información proporcionada es verídica y que asume plena responsabilidad por el contenido de este documento.</p>
              <p>El presente documento se firma en Santiago de Chile, con fecha ${new Date().toLocaleDateString()}.</p>
            </div>
            
            <div class="signature-area">
              <div class="section-title">Área de Firma</div>
              <div class="signature-box">
                <p>Zona para firma digital</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    setDocumentPreview(previewHTML);
    setShowPreview(true);
  };
  
  // Funciones para el manejo de la firma digital
  const iniciarFirma = () => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      signatureCtxRef.current = ctx;
    }
  };
  
  const iniciarDibujo = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!signatureCtxRef.current) return;
    
    setIsDrawing(true);
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Es un evento táctil
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Es un evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    signatureCtxRef.current.beginPath();
    signatureCtxRef.current.moveTo(x, y);
  };
  
  const dibujar = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCtxRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Es un evento táctil
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Es un evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    signatureCtxRef.current.lineTo(x, y);
    signatureCtxRef.current.stroke();
  };
  
  const terminarDibujo = () => {
    if (!signatureCtxRef.current) return;
    
    setIsDrawing(false);
    signatureCtxRef.current.closePath();
    
    // Guardar la imagen de la firma
    if (signatureCanvasRef.current) {
      setSignatureImage(signatureCanvasRef.current.toDataURL());
    }
  };
  
  const limpiarFirma = () => {
    if (!signatureCanvasRef.current || !signatureCtxRef.current) return;
    
    signatureCtxRef.current.clearRect(
      0, 
      0, 
      signatureCanvasRef.current.width, 
      signatureCanvasRef.current.height
    );
    
    setSignatureImage('');
  };
  
  // Funciones para verificación de identidad
  const iniciarCamara = async () => {
    setShowCamera(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      });
    }
  };
  
  const tomarFoto = () => {
    if (!videoRef.current || !photoRef.current) return;
    
    const video = videoRef.current;
    const canvas = photoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Ajustar dimensiones del canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar la imagen del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setPhotoTaken(true);
    
    // Detener la transmisión de la cámara
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const verificarIdentidad = () => {
    // En una implementación real, aquí se enviaría la foto a un servicio de verificación
    // Por ahora, simulamos una verificación exitosa
    setIdentityVerified(true);
    setShowCamera(false);
    
    toast({
      title: "Identidad verificada",
      description: "La identidad del cliente ha sido verificada correctamente",
      variant: "default",
    });
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
                  onClick={() => handleSeleccionarPago('efectivo')}
                >
                  <span>EFECTIVO</span>
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full p-8 text-xl flex justify-between items-center"
                  onClick={() => handleSeleccionarPago('tarjeta')}
                >
                  <span>TARJETA</span>
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full p-8 text-xl flex justify-between items-center"
                  onClick={() => handleSeleccionarPago('transferencia')}
                >
                  <span>TRANSFERENCIA</span>
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
                
                <div className="border-t pt-4">
                  <p className="text-center text-sm mb-1">El documento ha sido enviado al correo del cliente.</p>
                  <p className="text-center text-sm text-primary">Su comisión ha sido registrada automáticamente.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full p-6 text-lg flex items-center justify-center"
                  onClick={reiniciarProceso}
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Imprimir comprobante
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full p-6 text-lg"
                  onClick={reiniciarProceso}
                >
                  Procesar nuevo documento
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/partners/sdk-demo')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al menú principal
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
    <div className="bg-gray-100 min-h-screen">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => setLocation('/partners/sdk-demo')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-xl font-bold ml-2">Vecinos POS</h1>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium">Almacén Don Pedro</p>
            <p className="text-xs text-gray-500">ID: VEC-12345</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-2 mb-6">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Sistema activo</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Comisión:</span>
              <span className="font-medium text-primary ml-1">$27.500</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 pb-8">
          <div className="mb-4 border-b pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'inicio' ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'documentos' ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'pago' ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'comprobante' ? 'bg-primary text-white' : 'bg-gray-200'}`}>4</div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {step === 'inicio' && 'Paso 1: Registrar cliente'}
                  {step === 'documentos' && 'Paso 2: Seleccionar documento'}
                  {step === 'pago' && 'Paso 3: Procesar pago'}
                  {step === 'comprobante' && 'Paso 4: Comprobante'}
                </p>
              </div>
            </div>
          </div>
          
          {getPantallaActual()}
        </div>
      </div>
    </div>
  );
};

export default WebAppPOSButtons;