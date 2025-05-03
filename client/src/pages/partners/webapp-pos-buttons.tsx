import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, ArrowLeft, CheckCircle2, Printer, UserPlus, FileText, 
  CreditCard, ChevronRight, FileSignature, UserCheck, Shield, 
  Camera, RefreshCw, Download, X, Fingerprint, ClipboardList,
  CheckSquare, FileCheck, Home, User, LogOut, Wallet, Zap, PartyPopper
} from 'lucide-react';
import NFCIdentityReader from '@/components/identity/NFCIdentityReader';
import NFCMicroInteractions from '@/components/micro-interactions/NFCMicroInteractions';
import { CedulaChilenaData, checkNFCAvailability, NFCReadStatus } from '@/lib/nfc-reader';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para NFC y verificación de identidad
  const [showCamera, setShowCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showNFCReader, setShowNFCReader] = useState(false);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [nfcReadStatus, setNfcReadStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  
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
    const loadPartnerInfo = async () => {
      try {
        // Verificar si existe un token en localStorage
        const token = localStorage.getItem('vecinos_token');
        
        if (!token) {
          toast({
            title: "No has iniciado sesión",
            description: "Debes iniciar sesión como socio para acceder",
            variant: "destructive",
          });
          setLocation('/vecinos/login');
          return;
        }
        
        // Obtener información del socio desde la API
        const response = await fetch('/api/vecinos/partner-info', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('No se pudo obtener la información del socio');
        }
        
        const data = await response.json();
        setPartnerInfo(data);
        
        toast({
          title: "Bienvenido al POS Web",
          description: `${data.storeName} - ${data.address}`,
        });
      } catch (error) {
        console.error('Error al cargar información del socio:', error);
        toast({
          title: "Error de autenticación",
          description: "Por favor inicia sesión nuevamente",
          variant: "destructive",
        });
        // Redirigir al login si hay problemas con el token
        setLocation('/vecinos/login');
      } finally {
        setLoading(false);
      }
    };
    
    // Verificar disponibilidad de NFC
    const checkNFC = async () => {
      try {
        const result = await checkNFCAvailability();
        setNfcAvailable(result.available);
        
        if (result.available) {
          console.log(`NFC disponible: ${result.readerType}`);
        }
      } catch (error) {
        console.error('Error al verificar NFC:', error);
        setNfcAvailable(false);
      }
    };
    
    loadPartnerInfo();
    checkNFC();
  }, []);
  
  // Referencias para el canvas de firma
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Para la captura de foto de identidad
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  
  // Para lectura NFC
  const [cedulaData, setCedulaData] = useState<CedulaChilenaData | null>(null);
  
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
  
  // Función para iniciar la lectura NFC
  const iniciarLecturaNFC = () => {
    // Primero establecemos el estado idle para asegurar que el componente NFC se muestre correctamente
    setNfcReadStatus('idle');
    setShowNFCReader(true);
    setShowCamera(false);
    
    // Después de mostrar el modal, cambiamos el estado a scanning con un pequeño retraso
    // para permitir la transición visual
    setTimeout(() => {
      setNfcReadStatus('scanning');
    }, 500);
    
    // Registrar el inicio de la interacción en el sistema de gamificación
    apiRequest("POST", "/api/micro-interactions/record", {
      type: "nfc_scan_started",
      points: 5, // Puntos por intentar verificar con NFC
      metadata: { description: "Inicio de verificación con NFC" }
    }).catch(err => console.error("Error al registrar inicio de verificación:", err));
    
    toast({
      title: "Lector NFC activado",
      description: "Acerque la cédula chilena al lector NFC de su dispositivo",
    });
  };
  
  const handleNFCSuccess = (data: CedulaChilenaData) => {
    setCedulaData(data);
    
    // Actualizar el estado de lectura para las micro-interacciones
    setNfcReadStatus('success');
    
    // No cerramos inmediatamente el modal para permitir que se muestren las micro-interacciones
    // El componente NFCMicroInteractions llamará a onComplete después de la animación
    
    // Actualizar datos del cliente con la información de la cédula
    setClienteInfo(prevInfo => ({
      ...prevInfo,
      nombre: `${data.nombres} ${data.apellidos}`,
      rut: data.rut
    }));
    
    // Ahora el toast se mostrará después de las micro-interacciones
    // Las micro-interacciones completarán la verificación de identidad
    setIdentityVerified(true);
  };
  
  const handleNFCCancel = () => {
    setNfcReadStatus('idle');
    setShowNFCReader(false);
    toast({
      title: "Lectura NFC cancelada",
      description: "Se ha cancelado la lectura de la cédula",
      variant: "destructive",
    });
  };
  
  // Función para manejar cuando las micro-interacciones han finalizado
  const handleNFCInteractionsComplete = () => {
    // Registrar los puntos ganados en el sistema de gamificación
    const puntos = 125; // Puntos por verificar identidad con NFC
    
    // Llamar al endpoint para registrar la interacción (opcional)
    apiRequest("POST", "/api/micro-interactions/record", {
      type: "nfc_verification",
      points: puntos,
      metadata: { description: "Verificación de identidad con cédula NFC" }
    }).catch(err => console.error("Error al registrar micro-interacción:", err));
    
    setTimeout(() => {
      setShowNFCReader(false);
      setNfcReadStatus('idle');
      
      toast({
        title: "¡Verificación completada! +125 puntos",
        description: "Se ha verificado la identidad con éxito mediante NFC",
        variant: "default",
      });
    }, 1000); // Pequeño retraso para que se vea la animación completa
  };
  
  // El manejador para iniciar la lectura NFC fue declarado como duplicado y se eliminó
  
  // Manejador para error en la lectura NFC
  const handleNFCError = (error: any) => {
    // Actualizar el estado para mostrar la animación de error
    setNfcReadStatus('error');
    
    // Registrar el error para análisis (opcional)
    console.error("Error en lectura NFC:", error);
    
    // Identificar el tipo de error para mostrar un mensaje más específico
    let errorMessage = "No se pudo leer la cédula. Intente nuevamente.";
    
    if (error?.name === "NotSupportedError") {
      errorMessage = "Su dispositivo no admite la lectura NFC o está desactivada.";
    } else if (error?.name === "TimeoutError") {
      errorMessage = "Tiempo de espera agotado. Acerque la cédula nuevamente al lector.";
    } else if (error?.name === "InvalidStateError") {
      errorMessage = "El lector NFC no está disponible en este momento.";
    } else if (error?.message) {
      // Si hay un mensaje específico, usarlo
      errorMessage = error.message;
    }
    
    // No cerramos el modal instantáneamente para mostrar la animación de error
    setTimeout(() => {
      // Registrar la interacción fallida (opcionalmente con menos puntos negativos)
      apiRequest("POST", "/api/micro-interactions/record", {
        type: "nfc_verification_failed",
        points: -10, // Puntos negativos por fallo (opcional)
        metadata: { description: "Intento fallido de verificación NFC", error: errorMessage }
      }).catch(err => console.error("Error al registrar interacción fallida:", err));
      
      // Después de un tiempo razonable, cerrar el modal y mostrar el toast
      setNfcReadStatus('idle');
      setShowNFCReader(false);
      
      toast({
        title: "Error en la lectura NFC",
        description: errorMessage,
        variant: "destructive",
      });
    }, 2500);
  };

  const verificarIdentidad = () => {
    // Generar un ID de sesión único para la verificación
    const sessionId = `verify-pos-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Crear una URL para la verificación móvil
    // Usamos la URL unificada de verificación NFC con soporte de sesión
    const verificationUrl = `${window.location.origin}/verificacion-nfc?session=${sessionId}`;
    
    // Crear un diálogo para seleccionar el método de verificación
    const seleccionarMetodo = () => {
      // Simulamos un cuadro de diálogo personalizado (en producción sería un modal bonito)
      const metodo = window.prompt(
        "Seleccione el método de verificación:\n\n" +
        "1. Sistema READID (recomendado)\n" +
        "2. Lectura NFC simple\n" +
        "3. Fotografía de documento\n" +
        "4. Código QR para verificación móvil\n\n" +
        "Ingrese el número de la opción deseada (1-4):"
      );
      
      switch (metodo) {
        case "1": // READID
          // Mostrar opciones para READID
          const useREADID = window.confirm(
            "El sistema READID proporcionará la verificación más segura.\n\n" +
            "¿Desea abrir la interfaz READID en una nueva ventana o usar en este dispositivo?"
          );
          
          if (useREADID) {
            // En un entorno real, esto podría abrir en una ventana nueva o iframe
            // Para simplificar, registramos puntos y simulamos verificación exitosa
            
            // Registrar interacción
            apiRequest("POST", "/api/micro-interactions/record", {
              type: "readid_verification",
              points: 150,
              metadata: { description: "Verificación avanzada de identidad con READID (POS)" }
            }).catch(err => console.error("Error al registrar interacción:", err));
            
            // Confirmar si queremos simular verificación exitosa o abrir la URL
            const openREADID = window.confirm(
              "En un entorno de producción, esto abriría la interfaz READID.\n\n" +
              "Seleccione ACEPTAR para abrir la interfaz READID en otra ventana " +
              "o CANCELAR para simular una verificación exitosa."
            );
            
            if (openREADID) {
              // Abrir en nueva ventana
              // Abrir la URL unificada de verificación con el parámetro session
              window.open(verificationUrl, "_blank");
              
              // Simular que se completó la verificación después de un tiempo
              setTimeout(() => {
                setIdentityVerified(true);
                toast({
                  title: "¡Verificación READID completada! +150 puntos",
                  description: "Identidad verificada mediante sistema READID avanzado",
                  variant: "default",
                });
              }, 5000);
            } else {
              // Simular verificación exitosa
              setIdentityVerified(true);
              toast({
                title: "¡Verificación READID completada! +150 puntos",
                description: "Identidad verificada mediante sistema READID avanzado",
                variant: "default",
              });
            }
          } else {
            // Volver a mostrar opciones
            seleccionarMetodo();
          }
          break;
          
        case "2": // NFC simple
          if (nfcAvailable) {
            iniciarLecturaNFC();
          } else {
            toast({
              title: "NFC no disponible",
              description: "Este dispositivo no tiene NFC o está desactivado",
              variant: "destructive",
            });
            // Volver a mostrar opciones
            seleccionarMetodo();
          }
          break;
          
        case "3": // Fotografía
          if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
            iniciarCamara();
          } else {
            toast({
              title: "Cámara no disponible",
              description: "Este dispositivo no tiene cámara o está desactivada",
              variant: "destructive",
            });
            // Volver a mostrar opciones
            seleccionarMetodo();
          }
          break;
          
        case "4": // QR
          // Crear un código QR para la verificación (simulado, en producción usaríamos una biblioteca real)
          window.confirm(
            `Se ha generado un código QR con la URL: ${verificationUrl}\n\n` +
            `Escanee este código con su teléfono móvil para completar la verificación.\n\n` +
            `¿Desea simular una verificación exitosa?`
          ) && (() => {
            // Simulamos una verificación exitosa
            setIdentityVerified(true);
            setShowCamera(false);
            toast({
              title: "Identidad verificada",
              description: "La identidad del cliente ha sido verificada mediante el proceso avanzado",
              variant: "default",
            });
          })();
          break;
          
        default:
          // Si no se seleccionó una opción válida o se canceló
          toast({
            title: "Verificación cancelada",
            description: "No se seleccionó ningún método de verificación",
            variant: "destructive",
          });
          break;
      }
    };
    
    // Iniciar el proceso de selección
    seleccionarMetodo();
  };
  
  const procesarDocumento = async () => {
    // Verificar que se haya seleccionado un documento
    if (!tipoDocumento) {
      toast({
        title: "Error al procesar documento",
        description: "Debes seleccionar un tipo de documento",
        variant: "destructive",
      });
      return;
    }

    try {
      // Obtener token de localStorage
      const token = localStorage.getItem('vecinos_token');
      
      if (!token) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para procesar documentos",
          variant: "destructive",
        });
        setLocation('/vecinos/login');
        return;
      }
      
      // Preparar datos para la API
      const docSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
      const data = {
        documentType: tipoDocumento,
        clientInfo: {
          name: clienteInfo.nombre,
          rut: clienteInfo.rut,
          phone: clienteInfo.telefono,
          email: clienteInfo.email
        }
      };
      
      // Llamar a la API de procesamiento de documentos
      const response = await fetch('/api/vecinos/process-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar el documento');
      }
      
      const result = await response.json();
      
      // Mostrar confeti para celebrar
      showConfetti();
      
      // Actualizar estado y mostrar comprobante
      setProcesoCompletado(true);
      setStep('comprobante');
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Documento procesado!",
        description: `El documento ha sido procesado exitosamente. Comisión: $${result.commission}`,
      });
    } catch (error: any) {
      console.error('Error al procesar documento:', error);
      toast({
        title: "Error al procesar documento",
        description: error.message || "Ocurrió un error al procesar el documento",
        variant: "destructive",
      });
    }
  };
  
  // Función para mostrar efecto de confeti
  const showConfetti = () => {
    // En una implementación real, aquí se usaría una biblioteca como react-confetti
    // Para esta simulación, solo mostramos un mensaje
    console.log('¡Confeti! 🎉');
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
              
              {/* Botón NotaryPro con diseño moderno */}
              <button 
                onClick={handleRegistrarCliente}
                className="w-full mt-6 p-0 bg-transparent border-0 relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-zinc-800 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between w-full p-4 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-blue-900/50 hover:shadow-xl overflow-hidden">
                  <div className="absolute right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
                  <div className="absolute left-0 w-16 h-16 bg-blue-600/10 rounded-full translate-x-3 translate-y-6 group-hover:translate-y-12 transition-transform duration-500"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="bg-blue-600 p-2 rounded-md mr-3 shadow-md">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Registrar Cliente</span>
                  </div>
                  
                  <div className="relative z-10 flex items-center space-x-1">
                    <span className="text-xs font-medium text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">CONTINUAR</span>
                    <div className="p-1 rounded-md bg-blue-600">
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
              {/* Icono animado de documentos estilo NotaryPro */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-md animate-pulse opacity-50"></div>
                <div className="absolute inset-2 bg-blue-200 rounded-md animate-pulse opacity-70 delay-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-zinc-800">Seleccionar Documento</h2>
              <p className="text-zinc-500 max-w-md mx-auto">Elija el tipo de documento que necesita procesar</p>
              
              {/* Barra de búsqueda rápida estilo NotaryPro */}
              <div className="mt-4 max-w-md mx-auto relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input 
                  type="text"
                  placeholder="Buscar documento..."
                  className="pl-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 border-zinc-300"
                />
              </div>
            </div>
            
            {/* Grid de documentos con categorías estilo NotaryPro */}
            <div className="max-w-3xl mx-auto">
              {/* Categorías de documentos */}
              <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide gap-2">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-blue-700 shadow-sm">
                  Todos
                </div>
                <div className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-zinc-700 shadow-sm">
                  Contratos
                </div>
                <div className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-zinc-700 shadow-sm">
                  Declaraciones
                </div>
                <div className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-zinc-700 shadow-sm">
                  Autorizaciones
                </div>
                <div className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-zinc-700 shadow-sm">
                  Laborales
                </div>
              </div>
              
              {/* Documentos en formato tarjeta interactiva con estilo NotaryPro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentosDisponibles.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => handleSeleccionarDocumento(doc.id)}
                    className="bg-white rounded-md overflow-hidden shadow-md hover:shadow-lg border border-zinc-300 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:border-blue-500 group"
                  >
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-500">
                      <div className="h-1"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-zinc-800 rounded-md mr-3 shadow-sm">
                            {doc.id === 'contrato' && <FileText className="h-5 w-5 text-blue-400" />}
                            {doc.id === 'declaracion' && <ClipboardList className="h-5 w-5 text-blue-400" />}
                            {doc.id === 'autorizacion' && <CheckSquare className="h-5 w-5 text-blue-400" />}
                            {doc.id === 'finiquito' && <FileCheck className="h-5 w-5 text-blue-400" />}
                            {doc.id === 'compraventa' && <RefreshCw className="h-5 w-5 text-blue-400" />}
                            {doc.id === 'arriendo' && <Home className="h-5 w-5 text-blue-400" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-zinc-800">{doc.nombre}</h3>
                            <div className="text-xs text-zinc-500 mt-1">Código: <span className="font-medium text-blue-600">{doc.id.toUpperCase()}</span></div>
                          </div>
                        </div>
                        <div className="bg-blue-600 text-white font-bold rounded-md py-1 px-3 text-sm shadow-sm">
                          ${doc.precio}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-zinc-200 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="text-xs bg-zinc-800 text-zinc-100 px-2 py-1 rounded-md flex items-center shadow-sm">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                            Comisión: <span className="font-medium text-blue-300 ml-1">${Math.round(doc.precio * 0.15)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-100 p-1 rounded-md text-zinc-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Botón volver con estilo NotaryPro */}
              <button 
                onClick={() => setStep('inicio')}
                className="mt-6 relative group overflow-hidden rounded-md p-0 bg-transparent border-0"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center px-4 py-2 bg-zinc-100 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                  <ArrowLeft className="mr-2 h-4 w-4 text-zinc-700" />
                  <span className="font-medium text-zinc-800">Volver a datos del cliente</span>
                </div>
              </button>
            </div>
          </div>
        );
        
      case 'pago':
        const documentoSeleccionado = documentosDisponibles.find(d => d.id === tipoDocumento);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              {/* Icono animado de pagos estilo NotaryPro */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-md animate-pulse opacity-50"></div>
                <div className="absolute inset-2 bg-blue-200 rounded-md animate-pulse opacity-70 delay-150"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-zinc-800">Procesar Pago</h2>
              <p className="text-zinc-500 max-w-md mx-auto">El pago se procesará de forma segura</p>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Tarjeta de resumen con estilo NotaryPro */}
              <div className="bg-white rounded-md shadow-lg border border-zinc-300 mb-6 overflow-hidden">
                <div className="bg-zinc-800 p-3 text-white border-b border-blue-600">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Resumen del Pedido</h3>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                      NOTARYPRO
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="border-b border-zinc-200 pb-3 mb-3">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-zinc-800 rounded-md mr-3 shadow-sm">
                        {documentoSeleccionado?.id === 'contrato' && <FileText className="h-5 w-5 text-blue-400" />}
                        {documentoSeleccionado?.id === 'declaracion' && <ClipboardList className="h-5 w-5 text-blue-400" />}
                        {documentoSeleccionado?.id === 'autorizacion' && <CheckSquare className="h-5 w-5 text-blue-400" />}
                        {documentoSeleccionado?.id === 'finiquito' && <FileCheck className="h-5 w-5 text-blue-400" />}
                        {documentoSeleccionado?.id === 'compraventa' && <RefreshCw className="h-5 w-5 text-blue-400" />}
                        {documentoSeleccionado?.id === 'arriendo' && <Home className="h-5 w-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-800">{documentoSeleccionado?.nombre}</h4>
                        <p className="text-xs text-zinc-500">Código: <span className="font-medium text-blue-600">{documentoSeleccionado?.id.toUpperCase()}</span></p>
                      </div>
                    </div>
                    
                    <div className="ml-2 pl-6 border-l-2 border-blue-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-600">Cliente:</span>
                        <span className="font-medium text-zinc-800">{clienteInfo.nombre}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">RUT:</span>
                        <span className="font-medium text-zinc-800">{clienteInfo.rut}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Subtotal:</span>
                      <span className="font-medium text-zinc-800">${documentoSeleccionado?.precio}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">IVA (19%):</span>
                      <span className="font-medium text-zinc-800">Incluido</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-zinc-200 pt-2 mt-2">
                      <span className="text-zinc-800">Total:</span>
                      <span className="text-blue-600">${documentoSeleccionado?.precio}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs bg-zinc-800 p-2 rounded-md mt-3 text-zinc-100">
                      <span>Su comisión:</span>
                      <span className="font-bold text-blue-400">${Math.round((documentoSeleccionado?.precio || 0) * 0.15)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Métodos de pago estilo NotaryPro */}
              <div className="bg-white rounded-md shadow-md p-4 border border-zinc-300">
                <h3 className="text-lg font-bold mb-4 flex items-center text-zinc-800">
                  <div className="p-1.5 bg-blue-600 rounded-md mr-2">
                    <CreditCard className="h-5 w-5 text-white" />
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
                
                {/* Navegación con estilo NotaryPro */}
                <div className="flex justify-between mt-6">
                  {/* Botón volver con estilo NotaryPro */}
                  <button 
                    onClick={() => setStep('documentos')}
                    className="relative group overflow-hidden rounded-md border-0 p-0 bg-transparent"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center px-4 py-2 bg-zinc-100 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                      <ArrowLeft className="mr-2 h-4 w-4 text-zinc-700" />
                      <span className="font-medium text-zinc-800">Volver</span>
                    </div>
                  </button>
                  
                  {/* Botón principal con efecto NotaryPro */}
                  <button
                    onClick={() => handleSeleccionarPago('tarjeta')}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md blur opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="relative flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md text-white font-medium shadow-lg group-hover:shadow-blue-700/50 transition-all duration-300">
                      <span className="mr-2">Procesar Pago</span>
                      <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
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
            {/* Animación de éxito con confeti visual estilo NotaryPro */}
            <div className="text-center mb-6 relative">
              <div className="absolute inset-0 flex justify-center">
                <div className="relative w-32 h-32">
                  {/* Círculos animados que simulan un confeti simple */}
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-md w-2 h-2 opacity-70 animate-ping`}
                      style={{
                        backgroundColor: ['#2563EB', '#3B82F6', '#1E40AF', '#93C5FD'][i % 4],
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
                <div className="absolute inset-0 bg-blue-100 rounded-md animate-pulse opacity-40"></div>
                <div className="absolute inset-3 bg-blue-200 rounded-md animate-pulse opacity-60 delay-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-zinc-800">¡Operación exitosa!</h2>
              <p className="text-zinc-600 max-w-md mx-auto">El documento ha sido procesado y enviado al correo del cliente</p>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Ticket estilo comprobante NotaryPro */}
              <div className="bg-white rounded-md shadow-lg overflow-hidden border border-zinc-300 relative mb-8">
                {/* Borde superior estilo ticket */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 to-blue-500"></div>
                
                {/* Cabecera del ticket */}
                <div className="pt-6 pb-4 px-6 text-center border-b border-dashed border-zinc-200">
                  <div className="font-bold text-xl text-zinc-800 mb-1">NOTARYPRO</div>
                  <div className="text-sm text-zinc-600">Comprobante de Documento Digital</div>
                  <div className="mt-2 inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                    PAGO APROBADO
                  </div>
                </div>
                
                {/* Contenido del ticket */}
                <div className="px-6 py-4">
                  {/* Datos del documento y transacción */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-zinc-800 rounded-md mr-3 shadow-sm">
                        {docFinal?.id === 'contrato' && <FileText className="h-5 w-5 text-blue-400" />}
                        {docFinal?.id === 'declaracion' && <ClipboardList className="h-5 w-5 text-blue-400" />}
                        {docFinal?.id === 'autorizacion' && <CheckSquare className="h-5 w-5 text-blue-400" />}
                        {docFinal?.id === 'finiquito' && <FileCheck className="h-5 w-5 text-blue-400" />}
                        {docFinal?.id === 'compraventa' && <RefreshCw className="h-5 w-5 text-blue-400" />}
                        {docFinal?.id === 'arriendo' && <Home className="h-5 w-5 text-blue-400" />}
                      </div>
                      <h3 className="font-bold text-lg text-zinc-800">{docFinal?.nombre}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-zinc-100 p-3 rounded-md border border-zinc-200">
                        <div className="text-xs text-zinc-500 mb-1">Cliente</div>
                        <div className="font-medium text-zinc-800">{clienteInfo.nombre}</div>
                      </div>
                      <div className="bg-zinc-100 p-3 rounded-md border border-zinc-200">
                        <div className="text-xs text-zinc-500 mb-1">RUT</div>
                        <div className="font-medium text-zinc-800">{clienteInfo.rut}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-zinc-200 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Código:</span>
                        <span className="font-medium font-mono text-blue-600">{codigoComprobante}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Fecha:</span>
                        <span className="font-medium text-zinc-800">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Hora:</span>
                        <span className="font-medium text-zinc-800">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Método de pago:</span>
                        <span className="font-medium text-zinc-800">{metodoPago === 'tarjeta' ? 'Tarjeta' : metodoPago.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-zinc-200">
                        <span className="text-zinc-800">Total pagado:</span>
                        <span className="text-blue-600">${docFinal?.precio}</span>
                      </div>
                      <div className="flex justify-between text-xs bg-zinc-800 p-2 rounded-md mt-1 text-zinc-100">
                        <span>Su comisión:</span>
                        <span className="font-bold text-blue-400">${Math.round((docFinal?.precio || 0) * 0.15)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR code placeholder estilo NotaryPro */}
                  <div className="flex flex-col items-center mt-4 mb-2 pt-3 border-t border-dashed border-zinc-300">
                    <div className="relative">
                      <div className="w-24 h-24 bg-zinc-100 rounded-md mb-2 flex items-center justify-center text-zinc-600 border border-zinc-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
                        <div className="relative z-10">QR Code</div>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                        Verificado
                      </div>
                    </div>
                    <div className="text-xs text-zinc-600 text-center">
                      Escanee para verificar la autenticidad del documento
                    </div>
                  </div>
                  
                  {/* Botones de acción estilo NotaryPro */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {/* Botón de impresión */}
                    <button 
                      onClick={imprimirComprobante}
                      className="relative group overflow-hidden rounded-md p-0 border-0 bg-transparent"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center py-2.5 px-3 bg-zinc-100 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="mr-1.5 w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Printer className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="font-medium text-zinc-800">Imprimir</span>
                      </div>
                    </button>
                    
                    {/* Botón de vista previa */}
                    <button 
                      onClick={() => setShowPreview(true)}
                      className="relative group overflow-hidden rounded-md p-0 border-0 bg-transparent"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center py-2.5 px-3 bg-zinc-100 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="mr-1.5 w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-zinc-800">Ver documento</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Pie del ticket estilo NotaryPro */}
                <div className="py-3 px-6 bg-gradient-to-r from-zinc-100 to-zinc-50 text-center text-xs text-zinc-600 border-t border-dashed border-zinc-300">
                  <p className="font-medium">Gracias por usar NotaryPro</p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="h-0.5 w-10 bg-zinc-300 rounded-full mr-2"></div>
                    <p className="text-zinc-700">Documento verificable en <span className="text-blue-600 font-medium">www.tuu.cl/verificar</span></p>
                    <div className="h-0.5 w-10 bg-zinc-300 rounded-full ml-2"></div>
                  </div>
                </div>
                
                {/* Borde inferior estilo ticket NotaryPro */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 to-blue-500"></div>
              </div>
              
              {/* Botones de navegación estilo NotaryPro */}
              <div className="flex justify-between mt-6">
                {/* Botón nuevo cliente */}
                <button 
                  onClick={() => {
                    setIdentityVerified(false);
                    setPhotoTaken(false);
                    setSignatureImage('');
                    setStep('inicio');
                  }}
                  className="relative group overflow-hidden rounded-md p-0 border-0 bg-transparent"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center px-4 py-2 bg-zinc-100 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="mr-2 w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
                      <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="font-medium text-zinc-800">Nuevo cliente</span>
                  </div>
                </button>
                
                {/* Botón finalizar */}
                <button 
                  onClick={() => procesarDocumento()}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative flex items-center px-5 py-2.5 bg-blue-600 rounded-md text-white font-medium shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden">
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
      {/* Header con estilo NotaryPro */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-lg border-b-2 border-zinc-700">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 relative overflow-hidden">
                {/* Logo estilo NotaryPro como en la web principal */}
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-md shadow-md border border-zinc-200 flex items-center">
                    {/* Logo NotaryPro oficial rojo (imagen referencia) */}
                    <img 
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAoCAYAAAAcwQPnAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI1LTA1LTAyVDIxOjUwOjIzLTA1OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNS0wNS0wMlQyMTo1MjowNi0wNTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNS0wNS0wMlQyMTo1MjowNi0wNTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5NjZiMTllYi04NDRkLTI2NDEtOTE1Mi1hNWUyOTlkZGRmM2YiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDozYWMxMTViMS0zMjFiLWNiNDctOGYyNS05ZjAxNWE5ZDc5NWQiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkYTAwMzM3Mi01OGZhLTZjNDQtYmViOS05NTA1YmU3NmFiZTAiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmRhMDAzMzcyLTU4ZmEtNmM0NC1iZWI5LTk1MDViZTc2YWJlMCIgc3RFdnQ6d2hlbj0iMjAyNS0wNS0wMlQyMTo1MDoyMy0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5NjZiMTllYi04NDRkLTI2NDEtOTE1Mi1hNWUyOTlkZGRmM2YiIHN0RXZ0OndoZW49IjIwMjUtMDUtMDJUMjE6NTI6MDYtMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7nqJKIAAAH/UlEQVR4nO2cf4wdRRXHPzP73r7Xa6Ev1P64VLC00IY0UAWF/KiNSYkpVTQISBU0kcTEqKAmGBLjD2Ji+ofRRIImgoLVKD9UgkCkpJQiPlQKtBhKKAnQ0vvR6917vbd7uzv+Mff63u7O7N7bu3vXyzfZ7O7MmZk78803Z86cmYWMjIyMjIwTHC9C3yKt3w9kgEV12+KGfdv7E3iuAM4HZgHvHUDZbcBLQD2qXoDZwHeB9YN5gR7KxWOJHGD6MdT/buD4BI8/BSgF2r57DGMPJ+cDpwHP2AwN4OB/E8D+CMrNMHyMbwE9GuV7UmxnpNTe1pGobBc41s2QRzInZLDAJqA0iL7jgA8krBuVXcDXUtbJSDCYwOomvpOvs+2KwDjgY8CahL59wBZgItAAnAKcCZyWaJViFrDJYjvS7EQRv4TfM9Ju64jTAZwcqLPtaQDqDPUjgbAe6AY5g/8FJgM3Al8B/g483cc/DnV3+AnQj2iXAZci4eNm4Ps9jEsGC4C7UZOMDWgXmAF8FzG9LwK3APMjYxcR07QBCW/HA12JIcqQWdnlfeSW8l8JG9NbgW8Bt5E8CzOYCRwOyFZplnHkbfXr9t3NsxQKQ4B5MXYP+DgwGzgDmAucRfKh0TAWP+7rgP+lnagHoMh3H0fcDvXyLzB7hrOAd5DwM+jAsouv7bG/J2Jl1AH7Iu29DXwGeXpTgKeAB5FN5xHAK0ClfWMRs3MpcrMeQFa3D8SYbTUOIu92C1ADVCBzW0Wex0nA54H6WKPPIWAqMA34W4JIXaUJkqnAf4AvGvr8DEzXeCnQDqwh+oA5xAQdBoaSXPF1xGb6GJL8VyTJngCsRGZQNdSUa02uxsYROfk05B2vAF4BtkXkXgQ+g4QyKm8j83gCeSiakFyeKQabwKJGv6e/guwhOg1tq4AlgbJqLSKbszWIMwKJz9wYR/JwCsA/UB/5PeAc4DPAQwm604GPW8rLgAeQZ5rkcuBzpG9yRxrfZCJU/YP1nGaS9FOcgex3rgY2G9pfBb4OvBy4lp14/pMQU2mzT/OQiDDdcj0JLwE3xNgnIpmVYcC5ln4VwKrEtbGk2dxFdYzRFTYLuB34A/Bji2ypT3sURZu8RU4d3cqIQ7YTyUPxZPP0dVV8nSMWiSWIeVsNPJKQ+QaSqxRlPXCLalCDa/5GwP1GwsXQGLvFgRQG16UpLA7V13rSiSdlj0a4eBh4OlHnIZPjHUSDF2UDfq50NdF/LrcDtzIws7PFIv94yv5RLgZ+C3wFybOJchBZ5bYZZLpQy8nGG1YJl1W2rvGvdBZPl0VSAecDF1jkD6DoqSZyT/CyPxO+oZnIk7XaIL8KuJn0SfSbMOd+1Ljm+4CfGq69hKwkqxM6nsB8n05F1o6E9JILEcqyaL42UrT0exG4CvNDsQnZQN6Kv+K8inDiN8hk1CIzuIjoJvcB4DngaYOu25FsyA5Nf5t4BLnJQeoJ729rOQsJhYZ5qEj0Cx44dFfpb2GMfU+KfjofQ2cTGmUSkmecpOcVbzAT/3B2HvJH2a1pbwXW6WY7dJOl03EJcG2MY7mHB5CDb5AnwKtU9E9AkhBHkaduB/AKfvKvnZjEY9LtGWJYRUzyp0mXqbfluuqAOUOB30QHSzlCcYhPPhZZQaUEHVyLnBKPbHx0tNr4TDNR/PvAbYKc1gVzXCHyArAD2I2Y5D3Idp0u4LUZv8kiP9jYDjaTTlvLoE1YPG1RKE2+y2Ni7JcCL2raOjXyQYrIplqnQzHY3wvImZ0jgHbCJw/UJPkc5Cz9I/hOfhC1RLMO9RmchmQ+j5C0Kq4nbAJcYKFh4BlHdHPVBtyRDK/TyC9BRJvDkTxYchN7kmVsrU/SBvMpNdW1GfgKcA9+wdoCZFPZrWkbqulX7PkEkijVHs4NZ5o6TU+WjscRH20RZLW4EFho6L8X2SvUtYfYF2PbEJPRMXLOC1ybZhHLGdo8i3x7TGYSkkwuBtrfhboYsCXbHZLmAGzTyFR9I4E7ETMwA/gc5htqMkdqULxs0J9c1cRzGY8i5l/HPmRvZxn+U/sC8JRh/F/H2KuQF66KNNs3dLNJOeU1m2vFoMYEMXvbDe39hA8Otyv6RHmR8HZA+BxxM2Im0/BT/GNhGxID2/gcCZ+4yFdQnGwbcCv+OXid3rPxK2fJgztb8l13VGhTvRcJ0bcg+z4mVscku+Lrqh50hn9+YvxzkZXOVOSnIi8EzIj5YPE5wxjUTXMnkhQ7U9UgDnhTQp+KcmB4TPZ1g15bvsTWPgF/5dOF/L4K8XnuUbQnGYt/ujJOcRyZHwfYqBTfx9Sw46EImx66j8x0lJE90jT7vxHIHtOtmnZbgdJ0DV1lTftQJJl9LbLCuglz4ngzsnpTrQjHE34R2yM1JNO1Drl5P9fIDkH9vjmv13xrNRwKyLrM6VuDnA5dQnRlmPrGgqjlI8h+00fxT/rpsAuzfnQGLyJbMy5B3pbwrqVP1Ly5hj5JdG9ldFQhzvhLsbNOv7G0D3JR2bT6XFWbQsfKmMx04OcG/SXkRYiKmH5bIjq9mEyLJNXSbzzJ/KbL0FdwNhNfMcTTyW05oJmBuvrSHk6pbm1RXmgK3/7ZXt/p6i8a+qh0m85PutFJU04lrAyrbPqmiNe/OxBoC9qQ79D0d0i3r5h2Xk1UEj0Sc6k7slXp1uW+1Rn6j0NWjUVLWy2yQkzqUvWP9tH1UfWvJ/lbHzY7bdoHQve3xrh9UfvqPp7uZ/Wp7vuqPv2R+A2VRnfSdnVMvxXnddSipPMGVJ2hbKsr4Gup9rtmn3BvN/LdnPrU2OB1S2Gv6X5Xq0tXV1W6olxX1R51xEbB0pfgnaSV1xmCaOUcQ5saBz6D2QeTMXzUkz4vOKQk//tCRkZGRkbG/yfvAPcaOg+MrPMwAAAAAElFTkSuQmCC" 
                      className="h-6 mr-2"
                      alt="NotaryPro Logo"
                    />
                    <div>
                      <h1 className="text-xl font-black text-black tracking-tight">
                        NotaryPro
                      </h1>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Vecinos NotaryPro Express
                    </h2>
                    <p className="text-xs text-zinc-400">Transformando negocios locales</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 mt-2"></div>
              </div>
              <div className="ml-3 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-md flex items-center border border-blue-500 shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                SISTEMA POS v1.3.1
              </div>
            </div>
            
            <div className="relative">
              {/* Tarjeta identificativa con estilo NotaryPro */}
              <div className="text-right bg-zinc-800 px-4 py-2 rounded-md shadow-md border border-zinc-700 relative overflow-hidden">
                {/* Patrón gráfico en el fondo */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-10 grid-rows-5 gap-1 h-full">
                    {Array(50).fill(0).map((_, i) => (
                      <div key={i} className="bg-blue-500 rounded-sm"></div>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-black relative z-10 text-white">ALMACÉN DON PEDRO</p>
                <div className="flex items-center justify-end mt-1">
                  <div className="flex items-center bg-blue-900 px-2 py-0.5 rounded-md border border-blue-700 mr-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                    <span className="text-xs text-blue-200 font-medium">ACTIVO</span>
                  </div>
                  <div className="bg-zinc-700 text-white px-2 py-0.5 text-xs font-bold rounded-md border border-zinc-600 shadow-sm">
                    LOCAL-XP125
                  </div>
                </div>
              </div>
              
              {/* Insignia certificada */}
              <div className="absolute -right-2 -top-2 bg-blue-600 text-xs text-white font-bold px-1.5 py-0.5 rounded shadow-md">
                CERTIFICADO
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
            <div className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-md flex items-center shadow-md">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
              <span className="text-sm font-bold text-zinc-100">SISTEMA ACTIVO</span>
            </div>
            
            <div className="bg-zinc-800 border border-blue-600 px-3 py-1 rounded-md shadow-md">
              <span className="text-sm font-bold text-zinc-100">COMISIÓN: <span className="text-blue-400">$27.500</span></span>
            </div>
          </div>
        </div>
        
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
      
      {/* Modal para lector NFC */}
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
            
            <div className="p-4">
              {/* Contenedor con altura fija para ambos componentes */}
              <div className="relative h-72">
                {/* Componente de micro-interacciones en la capa superior */}
                <div className="absolute inset-0 z-10">
                  <NFCMicroInteractions 
                    status={nfcReadStatus}
                    points={125}
                    onComplete={handleNFCInteractionsComplete}
                  />
                </div>
                
                {/* Lector NFC que funciona por debajo de las animaciones */}
                <div className={`absolute inset-0 ${nfcReadStatus !== 'idle' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                  <NFCIdentityReader
                    onSuccess={handleNFCSuccess}
                    onCancel={handleNFCCancel}
                    onError={handleNFCError}
                  />
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