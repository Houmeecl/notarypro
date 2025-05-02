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
  const [clienteInfo, setClienteInfo] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: ''
  });
  
  // Este estado ya está declarado arriba y causa conflictos
  
  const documentosDisponibles = [
    { id: "doc1", nombre: "Declaración Jurada Simple", precio: 3500 },
    { id: "doc2", nombre: "Poder Especial", precio: 4500 },
    { id: "doc3", nombre: "Contrato de Arriendo", precio: 5500 },
    { id: "doc4", nombre: "Contrato de Compraventa", precio: 6500 },
    { id: "doc5", nombre: "Finiquito Laboral", precio: 4000 },
  ];

  const handleRegistrarCliente = () => {
    // Guardar información del cliente en el estado
    setClienteInfo({
      nombre: (document.getElementById('nombre') as HTMLInputElement)?.value || 'Juan Pérez González',
      rut: (document.getElementById('rut') as HTMLInputElement)?.value || '12.345.678-9',
      email: (document.getElementById('email') as HTMLInputElement)?.value || 'juan@ejemplo.cl',
      telefono: (document.getElementById('telefono') as HTMLInputElement)?.value || '+56 9 1234 5678'
    });
    setStep('documentos');
  };

  const handleSeleccionarDocumento = (id: string) => {
    setTipoDocumento(id);
    setStep('pago');
  };

  const handleSeleccionarPago = (tipo: string) => {
    setMetodoPago(tipo);
    
    // Si el método de pago es tarjeta, mostrar pantalla de pago con tarjeta
    if (tipo === 'tarjeta') {
      setStep('tarjeta');
    } else {
      // Para otros métodos de pago, continuar directamente al comprobante
      setProcesoCompletado(true);
      setStep('comprobante');
    }
  };
  
  // Procesar el pago con tarjeta
  const procesarPagoTarjeta = () => {
    setProcesoCompletado(true);
    setStep('comprobante');
    
    toast({
      title: "Pago procesado",
      description: "El pago con tarjeta ha sido procesado correctamente",
      variant: "default",
    });
  };

  const reiniciarProceso = () => {
    setTipoDocumento('');
    setMetodoPago('tarjeta');
    setProcesoCompletado(false);
    setStep('inicio');
    setShowPreview(false);
    setIdentityVerified(false);
    setShowCertifierPanel(false);
    setSignatureImage('');
    setPhotoTaken(false);
    setShowCamera(false);
    setDocumentPreview('');
    // Reiniciar también las firmas múltiples
    setSignatureImages(['', '']);
    setCurrentSignerIndex(0);
    setFirmantes([]);
  };
  
  // Función para mostrar la vista previa del documento
  const mostrarVistaPrevia = () => {
    const documentoSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
    if (!documentoSeleccionado) return;
    
    // Determinar si es un documento que necesita múltiples firmantes
    const requiereMultiplesFirmantes = documentoSeleccionado.id === "doc3" || documentoSeleccionado.id === "doc4"; // Arriendo o Compraventa
    
    // Si no hay firmantes adicionales y el documento lo requiere, añadir un firmante por defecto
    if (requiereMultiplesFirmantes && firmantes.length === 0) {
      // Añadir un segundo firmante de ejemplo para estos documentos
      setFirmantes([{
        nombre: "Ana Gómez Soto",
        rut: "15.456.789-0",
        relacion: documentoSeleccionado.id === "doc3" ? "Arrendador" : "Vendedor"
      }]);
    }
    
    // Obtener el segundo firmante si existe
    const segundoFirmante = firmantes.length > 0 ? firmantes[0] : null;
    
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
            .signature-area { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .signature-box { border: 1px dashed #ccc; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 10px; }
            .multi-signature { display: flex; gap: 20px; flex-wrap: wrap; }
            .signature-item { flex: 1; min-width: 250px; }
            .highlight { background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 3px solid #4a90e2; }
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
              <div class="section-title">Participantes del Documento</div>
              <div class="highlight">
                <div class="field">
                  <div class="field-label">Nombre:</div>
                  <div>${clienteInfo.nombre}</div>
                </div>
                <div class="field">
                  <div class="field-label">RUT:</div>
                  <div>${clienteInfo.rut}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div>${clienteInfo.email}</div>
                </div>
                <div class="field">
                  <div class="field-label">Teléfono:</div>
                  <div>${clienteInfo.telefono}</div>
                </div>
                <div class="field">
                  <div class="field-label">Rol:</div>
                  <div>${requiereMultiplesFirmantes ? (documentoSeleccionado.id === "doc3" ? "Arrendatario" : "Comprador") : "Firmante"}</div>
                </div>
              </div>
              
              ${segundoFirmante ? `
              <div class="highlight" style="margin-top: 15px;">
                <div class="field">
                  <div class="field-label">Nombre:</div>
                  <div>${segundoFirmante.nombre}</div>
                </div>
                <div class="field">
                  <div class="field-label">RUT:</div>
                  <div>${segundoFirmante.rut}</div>
                </div>
                <div class="field">
                  <div class="field-label">Rol:</div>
                  <div>${segundoFirmante.relacion}</div>
                </div>
              </div>
              ` : ''}
            </div>
            
            <div class="section">
              <div class="section-title">Contenido del Documento</div>
              ${documentoSeleccionado.id === "doc3" ? `
                <p>Este Contrato de Arriendo se celebra entre <strong>${firmantes.length > 0 ? firmantes[0].nombre : 'la parte arrendadora'}</strong> como Arrendador y <strong>${clienteInfo.nombre}</strong> como Arrendatario.</p>
                <p>Ambas partes acuerdan que la propiedad será arrendada por un período establecido, sujeto a las condiciones detalladas en este contrato.</p>
              ` : documentoSeleccionado.id === "doc4" ? `
                <p>Este Contrato de Compraventa se celebra entre <strong>${firmantes.length > 0 ? firmantes[0].nombre : 'la parte vendedora'}</strong> como Vendedor y <strong>${clienteInfo.nombre}</strong> como Comprador.</p>
                <p>Ambas partes acuerdan la transferencia de propiedad objeto de este contrato por el precio acordado, sujeto a las condiciones aquí detalladas.</p>
              ` : `
                <p>Este ${documentoSeleccionado.nombre} se genera de conformidad con las leyes de la República de Chile y tiene plena validez legal.</p>
                <p>El firmante declara bajo juramento que toda la información proporcionada es verídica y que asume plena responsabilidad por el contenido de este documento.</p>
              `}
              <p>El presente documento se firma en Santiago de Chile, con fecha ${new Date().toLocaleDateString()}.</p>
            </div>
            
            <div class="signature-area">
              <div class="section-title">Área de Firma</div>
              ${segundoFirmante ? `
                <div class="multi-signature">
                  <div class="signature-item">
                    <p><strong>${clienteInfo.nombre}</strong><br/>${requiereMultiplesFirmantes ? (documentoSeleccionado.id === "doc3" ? "Arrendatario" : "Comprador") : "Firmante"}</p>
                    <div class="signature-box">
                      <p>Firma digital pendiente</p>
                    </div>
                  </div>
                  <div class="signature-item">
                    <p><strong>${segundoFirmante.nombre}</strong><br/>${segundoFirmante.relacion}</p>
                    <div class="signature-box">
                      <p>Firma digital pendiente</p>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="signature-box">
                  <p>Zona para firma digital</p>
                </div>
              `}
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
      const imageData = signatureCanvasRef.current.toDataURL();
      setSignatureImage(imageData);
      
      // Guardar la firma en el array según el firmante actual
      const newSignatureImages = [...signatureImages];
      newSignatureImages[currentSignerIndex] = imageData;
      setSignatureImages(newSignatureImages);
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
    
    // Limpiar solo la firma del firmante actual
    setSignatureImage('');
    const newSignatureImages = [...signatureImages];
    newSignatureImages[currentSignerIndex] = '';
    setSignatureImages(newSignatureImages);
  };
  
  // Cambiar entre los firmantes
  const cambiarFirmante = () => {
    const documentoSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
    if (!documentoSeleccionado) return;
    
    // Solo permitir cambiar firmante si es un documento con múltiples firmantes
    const requiereMultiplesFirmantes = documentoSeleccionado.id === "doc3" || documentoSeleccionado.id === "doc4";
    if (!requiereMultiplesFirmantes || firmantes.length === 0) return;
    
    // Cambiar al siguiente firmante
    setCurrentSignerIndex(currentSignerIndex === 0 ? 1 : 0);
    
    // Restaurar el canvas con la firma del nuevo firmante seleccionado (si existe)
    if (signatureCanvasRef.current && signatureCtxRef.current) {
      // Limpiar el canvas
      signatureCtxRef.current.clearRect(
        0, 
        0, 
        signatureCanvasRef.current.width, 
        signatureCanvasRef.current.height
      );
      
      // Mostrar la firma existente del firmante seleccionado (si existe)
      const nextIndex = currentSignerIndex === 0 ? 1 : 0;
      if (signatureImages[nextIndex]) {
        const img = new Image();
        img.onload = () => {
          if (signatureCtxRef.current && signatureCanvasRef.current) {
            signatureCtxRef.current.drawImage(img, 0, 0);
          }
        };
        img.src = signatureImages[nextIndex];
      }
      
      // Actualizar la imagen de firma mostrada
      setSignatureImage(signatureImages[nextIndex] || '');
    }
    
    // Mostrar mensaje al usuario
    const nuevoFirmante = currentSignerIndex === 0 ? firmantes[0].nombre : clienteInfo.nombre;
    toast({
      title: "Cambio de firmante",
      description: `Ahora firmará: ${nuevoFirmante}`,
    });
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
                
                <div className="border-t pt-4">
                  <p className="text-center text-sm mb-1">El documento ha sido enviado al correo del cliente.</p>
                  <p className="text-center text-sm text-primary">Su comisión ha sido registrada automáticamente.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full p-6 text-lg flex items-center justify-center"
                  onClick={imprimirComprobante}
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Imprimir comprobante
                </Button>
                
                <Button 
                  size="lg"
                  variant="default"
                  className="w-full p-6 text-lg flex items-center justify-center"
                  onClick={mostrarVistaPrevia}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Ver documento
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
        
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Previsualización</h2>
              <p className="text-gray-500">Verifique el documento antes de continuar</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <Button variant="outline" onClick={iniciarCamara} disabled={identityVerified}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {identityVerified ? 'Identidad verificada' : 'Verificar identidad'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowPreview(false);
                    setStep('firmar');
                  }}
                  disabled={!identityVerified}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Firmar documento
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full mt-4" 
                onClick={() => {
                  setShowPreview(false);
                  setStep('pago');
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>
        );
      
      case 'firmar':
        // Determinar si es un documento que necesita múltiples firmantes
        const docRequiereMultiplesFirmantes = tipoDocumento === "doc3" || tipoDocumento === "doc4"; // Arriendo o Compraventa
        const segundoFirmante = firmantes.length > 0 ? firmantes[0] : null;
        const nombreFirmanteActual = currentSignerIndex === 0 ? clienteInfo.nombre : (segundoFirmante?.nombre || '');
        const rolFirmanteActual = currentSignerIndex === 0 
          ? (docRequiereMultiplesFirmantes ? (tipoDocumento === "doc3" ? "Arrendatario" : "Comprador") : "Firmante")
          : (segundoFirmante?.relacion || '');
          
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileSignature className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Firma Digital</h2>
              
              {docRequiereMultiplesFirmantes && segundoFirmante ? (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-blue-800 font-medium">
                    Firmante actual: <span className="font-bold">{nombreFirmanteActual}</span>
                    <span className="text-sm ml-2">({rolFirmanteActual})</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentSignerIndex === 0 ? "Primer firmante" : "Segundo firmante"} de 2
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Firme en el área indicada</p>
              )}
            </div>
            
            <div className="max-w-md mx-auto">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white"
                style={{ touchAction: 'none' }}
              >
                <canvas
                  ref={signatureCanvasRef}
                  width={600}
                  height={200}
                  className="w-full h-52 rounded cursor-crosshair touch-none"
                  onMouseDown={iniciarDibujo}
                  onMouseMove={dibujar}
                  onMouseUp={terminarDibujo}
                  onMouseLeave={terminarDibujo}
                  onTouchStart={iniciarDibujo}
                  onTouchMove={dibujar}
                  onTouchEnd={terminarDibujo}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between mt-4">
                <Button variant="outline" onClick={limpiarFirma}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                
                {docRequiereMultiplesFirmantes && segundoFirmante && (
                  <Button 
                    variant="outline" 
                    onClick={cambiarFirmante}
                    className="bg-gray-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cambiar firmante
                  </Button>
                )}
                
                <Button 
                  onClick={() => {
                    // Si es el primer firmante de un documento con múltiples firmantes y aún no hay
                    // firma del segundo firmante, cambiar al segundo firmante automáticamente
                    if (docRequiereMultiplesFirmantes && segundoFirmante && 
                        currentSignerIndex === 0 && !signatureImages[1]) {
                      cambiarFirmante();
                      toast({
                        title: "Continúe con el segundo firmante",
                        description: `Ahora debe firmar: ${segundoFirmante.nombre}`,
                      });
                    } else {
                      // Si ya están todas las firmas o es un documento de un solo firmante, pasar a certificar
                      setStep('certificar');
                    }
                  }}
                  disabled={!signatureImage}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {docRequiereMultiplesFirmantes && segundoFirmante && currentSignerIndex === 0 && !signatureImages[1] 
                    ? "Siguiente firmante" 
                    : "Continuar"}
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full mt-4" 
                onClick={() => {
                  setShowPreview(true);
                  setStep('preview');
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>
        );
        
      case 'certificar':
        // Determinar si el documento tiene múltiples firmantes
        const requiereMultiplesFirmantes = tipoDocumento === "doc3" || tipoDocumento === "doc4";
        const haySegundoFirmante = firmantes.length > 0;
        
        // Verificar si todas las firmas necesarias están completas
        const firmasPendientes = requiereMultiplesFirmantes && haySegundoFirmante 
          ? (!signatureImages[0] || !signatureImages[1]) 
          : !signatureImages[0];
          
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Certificación</h2>
              <p className="text-gray-500">Certifique el documento para completar el proceso</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-lg border space-y-4">
                <h3 className="font-medium text-lg">Estado del documento</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${identityVerified ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {identityVerified && <Check className="h-3 w-3" />}
                    </div>
                    <span className={identityVerified ? 'text-green-700' : 'text-gray-500'}>
                      Verificación de identidad
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${signatureImages[0] ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {signatureImages[0] && <Check className="h-3 w-3" />}
                    </div>
                    <span className={signatureImages[0] ? 'text-green-700' : 'text-gray-500'}>
                      Firma principal: {clienteInfo.nombre}
                    </span>
                  </div>
                  
                  {requiereMultiplesFirmantes && haySegundoFirmante && (
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${signatureImages[1] ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {signatureImages[1] && <Check className="h-3 w-3" />}
                      </div>
                      <span className={signatureImages[1] ? 'text-green-700' : 'text-gray-500'}>
                        Segunda firma: {firmantes[0].nombre}
                      </span>
                    </div>
                  )}
                </div>
                
                {firmasPendientes ? (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 flex-shrink-0 text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-800">Firmas pendientes</p>
                        <p className="text-sm text-yellow-700">
                          {requiereMultiplesFirmantes
                            ? "Este documento requiere la firma de ambas partes antes de certificar."
                            : "Se requiere la firma del cliente antes de certificar."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 flex-shrink-0 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Documento listo</p>
                        <p className="text-sm text-green-700">
                          El documento contiene todas las firmas requeridas y está listo para certificar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {certificadorMode ? (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={mostrarPanelCertificador}
                        disabled={firmasPendientes}
                      >
                        <Fingerprint className="h-4 w-4 mr-2" />
                        Firma con eToken y certificar 
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Documento certificado",
                            description: "El documento ha sido certificado y enviado al cliente",
                          });
                          setStep('comprobante');
                        }}
                        disabled={firmasPendientes}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Certificar con firma simple
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full bg-primary text-white" 
                      onClick={() => {
                        setCertificadorMode(true);
                        toast({
                          title: "Modo certificador activado",
                          description: "Por favor realice la certificación del documento",
                        });
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Solicitar certificación
                    </Button>
                  )}
                </div>
              </div>
              
              {!certificadorMode && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-4" 
                  onClick={() => {
                    setStep('firmar');
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a firmar
                </Button>
              )}
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
                      {identityVerified ? (
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
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                            <div className="flex items-center mb-2">
                              <Fingerprint className="h-5 w-5 text-yellow-600 mr-2" />
                              <h3 className="font-medium text-yellow-700">Pendiente de verificación</h3>
                            </div>
                            <p className="text-sm text-yellow-600">
                              La identidad del cliente debe ser verificada antes de firmar el documento.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                              <h3 className="text-md font-medium mb-2">Verificación con cámara</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                Captura de imagen para verificación básica de identidad.
                              </p>
                              <Button 
                                className="w-full" 
                                variant="outline" 
                                onClick={iniciarCamara}
                              >
                                Verificar con cámara
                              </Button>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                              <h3 className="text-md font-medium mb-2 text-blue-700">Verificación avanzada</h3>
                              <p className="text-sm text-blue-600 mb-3">
                                Proceso biométrico completo con validación facial y prueba de vida.
                              </p>
                              <Button 
                                className="w-full" 
                                variant="default"
                                onClick={verificarIdentidad}
                              >
                                Iniciar verificación avanzada
                              </Button>
                            </div>
                          </div>
                          
                          {showCamera && !photoTaken && (
                            <div className="mt-4 p-4 border rounded-lg">
                              <h3 className="text-md font-medium mb-2">Captura de cámara</h3>
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex justify-between mt-3">
                                <Button variant="outline" onClick={() => setShowCamera(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={tomarFoto}>
                                  Capturar
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {photoTaken && (
                            <div className="mt-4 p-4 border rounded-lg">
                              <h3 className="text-md font-medium mb-2">Foto capturada</h3>
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <canvas 
                                  ref={photoRef} 
                                  className="w-full h-auto" 
                                />
                              </div>
                              <div className="flex justify-between mt-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setPhotoTaken(false);
                                    iniciarCamara();
                                  }}
                                >
                                  Volver a capturar
                                </Button>
                                <Button onClick={verificarIdentidad}>
                                  Verificar identidad
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
                                <p className="text-xs font-medium mb-1">Dispositivo</p>
                                <p className="text-sm">eToken SafeNet 5110</p>
                              </div>
                              <div className="bg-white p-3 border rounded">
                                <p className="text-xs font-medium mb-1">Certificado</p>
                                <p className="text-sm truncate">Certificador NotaryPro</p>
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 border rounded">
                              <Label htmlFor="pin" className="text-xs font-medium">PIN de acceso</Label>
                              <Input 
                                id="pin" 
                                type="password" 
                                className="mt-1" 
                                placeholder="Ingrese el PIN de su eToken" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="default"
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Firmando con eToken",
                                description: "Procesando firma avanzada del certificador...",
                              });
                              
                              // Simulamos el tiempo que tomaría firmar con eToken
                              setTimeout(() => {
                                setShowCertifierPanel(false);
                                toast({
                                  title: "Documento certificado",
                                  description: "El documento ha sido certificado con firma electrónica avanzada.",
                                  variant: "default",
                                });
                              }, 2000);
                            }}
                            disabled={!identityVerified || !signatureImage}
                          >
                            <Fingerprint className="h-4 w-4 mr-2" />
                            Firmar con eToken y certificar
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setShowCertifierPanel(false);
                              toast({
                                title: "Documento certificado",
                                description: "El documento ha sido certificado correctamente.",
                                variant: "default",
                              });
                            }}
                            disabled={!identityVerified || !signatureImage}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Certificar con firma simple
                          </Button>
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