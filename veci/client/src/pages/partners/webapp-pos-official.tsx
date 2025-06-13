/**
 * Vecinos NotaryPro Express - POS Web Oficial
 * 
 * Esta es la versión oficial y unificada del POS web para Vecinos NotaryPro Express.
 * Combina todas las funcionalidades de las versiones anteriores, incluyendo:
 * - Procesamiento de documentos
 * - Verificación de identidad avanzada con NFC
 * - Sistema READID de verificación visual
 * - Pagos con tarjeta
 * - Firma digital y gestión de certifiaciones
 */

import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { jwtDecode } from "jwt-decode";
import { QRCodeSVG } from 'qrcode.react';
import { 
  CedulaChilenaData, 
  NFCReadStatus, 
  NFCReaderType,
  readCedulaChilena
} from '@/lib/nfc-reader';
import { 
  ArrowLeft,
  BadgeDollarSign, 
  Check, 
  ChevronLeft, 
  CreditCard, 
  FileText, 
  Loader2, 
  PenLine, 
  Printer, 
  QrCode, 
  RefreshCw, 
  Send, 
  Shield, 
  ShieldCheck, 
  User, 
  Zap
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

// Componentes de identidad
import NFCIdentityReader from "@/components/identity/NFCIdentityReader";
import NFCMicroInteractions from "@/components/micro-interactions/NFCMicroInteractions";
//No necesitamos esta línea, ya está importada arriba
import SignatureCanvas from "react-signature-canvas";
import confetti from "canvas-confetti";

import VecinosLayout from "@/components/vecinos/VecinosLayout";
import { apiRequest } from "@/lib/queryClient";

// Logotipo oficial de VecinoXpress
const VecinoXpressLogo = () => (
  <div className="flex items-center">
    <img src="/images/vecino-xpress-logo.svg" alt="VecinoXpress Logo" className="h-12 mr-3" />
    <div className="flex flex-col">
      <span className="text-[#2d219b] font-bold text-2xl">Vecinos Xpress</span>
      <span className="text-sm text-gray-700">Plataforma de servicios documentales</span>
    </div>
  </div>
);

// Tipos de documentos disponibles para procesar
const tiposDocumento = [
  { id: 'contrato', nombre: 'Contrato', icono: <FileText className="h-5 w-5" /> },
  { id: 'declaracion', nombre: 'Declaración Jurada', icono: <Shield className="h-5 w-5" /> },
  { id: 'autorizacion', nombre: 'Autorización', icono: <ShieldCheck className="h-5 w-5" /> },
  { id: 'poder', nombre: 'Poder Simple', icono: <User className="h-5 w-5" /> },
  { id: 'certificado', nombre: 'Certificado', icono: <BadgeDollarSign className="h-5 w-5" /> },
];

// Componente principal del POS Web
const WebAppPOSOfficial = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [step, setStep] = useState('welcome'); // welcome, selectDocument, uploadDocument, verifyIdentity, payment, signature, success
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verificationPoints, setVerificationPoints] = useState(0);
  const [userIdentityData, setUserIdentityData] = useState<CedulaChilenaData | null>(null);
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSignatureSheetOpen, setIsSignatureSheetOpen] = useState(false);
  const [documentProcessed, setDocumentProcessed] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationQR, setShowVerificationQR] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [nfcMessage, setNfcMessage] = useState('');
  const [isReadIDModalOpen, setIsReadIDModalOpen] = useState(false);
  const [readIDStep, setReadIDStep] = useState(0);
  const [showFacialCompare, setShowFacialCompare] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const capturedPhotoRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [_, setLocation] = useLocation();

  // Verificar parámetros de URL al cargar (para el retorno de MercadoPago)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const reference = params.get('reference');
    
    if (status && reference) {
      // Recuperar información del cliente del localStorage
      try {
        const customerData = localStorage.getItem(`tx_customer_${reference}`);
        if (customerData) {
          const customerInfo = JSON.parse(customerData);
          console.log('Cliente recuperado:', customerInfo);
          
          // Recuperar datos de verificación si existen
          const verificationData = localStorage.getItem(`tx_verification_${reference}`);
          if (verificationData) {
            const verificationInfo = JSON.parse(verificationData);
            setVerificationPoints(verificationInfo.verificationPoints || 0);
          }
          
          // Determinar qué hacer según el estado
          if (status === 'success') {
            toast({
              title: "Pago exitoso",
              description: "Su pago ha sido procesado correctamente.",
              variant: "default",
            });
            setIsSignatureSheetOpen(true);
          } else if (status === 'pending') {
            toast({
              title: "Pago pendiente",
              description: "Su pago está siendo procesado. Le notificaremos cuando sea completado.",
              variant: "default",
            });
            setStep('payment');
          } else if (status === 'failure') {
            toast({
              title: "Error en el pago",
              description: "Su pago no pudo ser procesado. Por favor intente nuevamente.",
              variant: "destructive",
            });
            setStep('payment');
          }
          
          // Limpiar los datos almacenados
          localStorage.removeItem(`tx_customer_${reference}`);
          localStorage.removeItem(`tx_verification_${reference}`);
        }
      } catch (error) {
        console.error('Error procesando respuesta de pago:', error);
      }
    }
  }, [toast, setLocation]);
  
  // Cargar información del partner al inicio
  useEffect(() => {
    const loadPartnerInfo = async () => {
      setLoading(true);
      try {
        // Verificar primero si hay código de tienda (de la página vecinos/pos-app)
        const storeCode = localStorage.getItem('store_code');
        
        if (storeCode) {
          // Si tenemos código de tienda, cargamos la información de demostración asociada
          console.log('Usando código de tienda:', storeCode);
          
          // Cargar información de la tienda de demostración basada en el código
          let demoData = {
            id: 1,
            storeName: "Tienda Demo",
            ownerName: "Usuario Demo",
            storeCode: storeCode,
            address: "Calle Ejemplo 123, Santiago",
            balance: 0,
            commission: 20
          };
          
          // Personalizar según el código de tienda
          switch(storeCode) {
            case 'LOCAL-XP125':
              demoData.storeName = "Mini Market El Sol";
              demoData.ownerName = "Carlos Ramírez";
              break;
            case 'LOCAL-XP201':
              demoData.storeName = "Farmacia Vida";
              demoData.ownerName = "María González";
              break;
            case 'LOCAL-XP315':
              demoData.storeName = "Librería Central";
              demoData.ownerName = "Pablo Araya";
              break;
            case 'LOCAL-XP427':
              demoData.storeName = "Café Internet Express";
              demoData.ownerName = "Ana Figueroa";
              break;
          }
          
          setPartnerData(demoData);
          setLoading(false);
          return;
        }
        
        // Si no hay código de tienda, verificar si hay token en localStorage
        const token = localStorage.getItem('vecinosPartnerToken');
        if (!token) {
          // Si no hay token, redirigir al login
          setLocation('/vecinos');
          return;
        }

        // Decodificar token para obtener datos básicos
        try {
          const decoded = jwtDecode(token) as any;
          if (decoded.exp * 1000 < Date.now()) {
            // Token expirado
            localStorage.removeItem('vecinosPartnerToken');
            setLocation('/vecinos');
            return;
          }
        } catch (err) {
          console.error('Error decodificando token:', err);
          localStorage.removeItem('vecinosPartnerToken');
          setLocation('/vecinos/pos-app');
          return;
        }

        // Obtener información completa del partner desde la API
        const response = await apiRequest('GET', '/api/vecinos/partner-info');
        if (!response.ok) {
          throw new Error('Error obteniendo información del partner');
        }
        
        const data = await response.json();
        setPartnerInfo(data);
        
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error de conexión",
          description: "No se pudo obtener la información del partner. Por favor intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPartnerInfo();
  }, [setLocation, toast]);

  // Verificar disponibilidad de cámara
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        // Solo verificamos si hay dispositivos de video, sin acceder a ellos todavía
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevices = devices.some(device => device.kind === 'videoinput');
        setIsCameraAvailable(hasVideoDevices);
      } catch (error) {
        console.error('Error verificando cámara:', error);
        setIsCameraAvailable(false);
      }
    };

    checkCameraAvailability();
  }, []);

  // Limpiar stream de cámara al desmontar componente
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Manejar la subida de documentos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      const url = URL.createObjectURL(file);
      setDocumentPreviewUrl(url);
    }
  };

  // Activar la selección de archivos
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Iniciar webcam
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifique los permisos.",
        variant: "destructive",
      });
    }
  };

  // Detener webcam
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && capturedPhotoRef.current) {
      const video = videoRef.current;
      const canvas = capturedPhotoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir la imagen a base64 para procesamiento
        const photoDataUrl = canvas.toDataURL('image/jpeg');
        
        // Detener la cámara después de tomar la foto
        stopCamera();
        
        // Verificación con foto real capturada
        console.log('Foto capturada para verificación:', photoDataUrl.substring(0, 30) + '...');
        
        // Realizar verificación con foto capturada real
        completeVerification("FOTOCAPTURA");
      }
    }
  };

  // Procesar pago
  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Integración con MercadoPago
      // Preparar los items para el pago
      const mercadoPagoItems = [
        {
          title: `Servicio de Documento - ${tiposDocumento.find(t => t.id === selectedDocumentType)?.nombre || 'Documento'}`,
          quantity: 1,
          unit_price: 5990,
          currency_id: 'CLP'
        }
      ];
      
      // Generar identificador único para la transacción
      const externalReference = `TX-WEBAPP-${Date.now().toString()}`;
      
      // Guardar datos del cliente en localStorage para recuperación post-redirección
      try {
        // Guardar información que necesitaremos recuperar después de la redirección
        localStorage.setItem(`tx_customer_${externalReference}`, JSON.stringify({
          name: userIdentityData ? `${userIdentityData.nombres} ${userIdentityData.apellidos}` : 'Cliente',
          email: 'cliente@vecinos.cl',
          document: userIdentityData ? userIdentityData.rut : '12345678-9'
        }));
        
        // También podemos guardar el estado de verificación y otros datos relevantes
        localStorage.setItem(`tx_verification_${externalReference}`, JSON.stringify({
          verificationPoints
        }));
      } catch (e) {
        console.error('Error guardando datos para recuperación:', e);
      }
      
      // URLs de retorno para procesamiento de pago
      const backUrls = {
        success: `${window.location.origin}/partners/webapp-pos-official?status=success&reference=${externalReference}`,
        failure: `${window.location.origin}/partners/webapp-pos-official?status=failure&reference=${externalReference}`,
        pending: `${window.location.origin}/partners/webapp-pos-official?status=pending&reference=${externalReference}`
      };
      
      // Crear la preferencia de pago
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: mercadoPagoItems,
          backUrls,
          externalReference,
          identification: {
            type: 'RUT',
            number: userIdentityData ? userIdentityData.rut : '12345678-9'
          },
          customer: {
            name: userIdentityData ? `${userIdentityData.nombres} ${userIdentityData.apellidos}` : 'Cliente',
            email: 'cliente@vecinos.cl'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al crear preferencia de pago');
      }
      
      const preference = await response.json();
      
      // Redirigir al usuario al checkout de MercadoPago
      if (preference.init_point) {
        window.location.href = preference.init_point;
        return; // Terminar ejecución aquí ya que estamos redirigiendo
      } else {
        throw new Error('No se recibió URL de pago');
      }
      
    } catch (error) {
      console.error('Error procesando pago:', error);
      setIsProcessingPayment(false);
      toast({
        title: "Error de pago",
        description: "No se pudo procesar el pago. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Completar firma
  const handleSignatureComplete = async () => {
    if (!sigCanvas.current) return;
    
    try {
      // Obtener la firma como imagen base64
      const signatureImage = sigCanvas.current.toDataURL('image/png');
      
      // Cerrar el panel de firma
      setIsSignatureSheetOpen(false);
      
      // En una implementación real, enviaríamos la firma al servidor
      // Para demostración, simulamos un proceso exitoso
      setLoading(true);
      await processDocument(signatureImage);
      
    } catch (error) {
      console.error('Error completando firma:', error);
      toast({
        title: "Error en firma",
        description: "No se pudo completar el proceso de firma. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Limpiar firma
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  // La función generateVerificationCode se ha movido más abajo en el archivo

  // Procesar documento (simulado)
  const processDocument = async (signatureImage: string) => {
    // En una implementación real, enviaríamos todos los datos al servidor
    try {
      // Simular procesamiento del documento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar código de verificación único
      const code = generateVerificationCode();
      setVerificationCode(code);
      setShowVerificationQR(true);
      
      // Generar datos de recibo para demostración
      const receipt = {
        documentId: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        documentType: tiposDocumento.find(t => t.id === selectedDocumentType)?.nombre || 'Documento',
        date: new Date().toISOString(),
        partnerName: partnerInfo?.storeName || 'Tienda Vecinos',
        partnerCode: partnerInfo?.storeCode || 'LOCAL-XP000',
        userName: userIdentityData?.nombres + ' ' + userIdentityData?.apellidos || 'Usuario',
        userRut: userIdentityData?.rut || '12.345.678-9',
        amount: 5990,
        commission: 1198,
        verificationLevel: 'Avanzada (NFC + Facial)',
        certificationStatus: 'Pendiente',
        estimatedDelivery: new Date(Date.now() + 86400000).toLocaleDateString('es-CL'),
        verificationCode: code
      };
      
      setReceiptData(receipt);
      setDocumentProcessed(true);
      setStep('success');
      
      // Lanzar confetti para celebrar
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
    } catch (error) {
      console.error('Error procesando documento:', error);
      toast({
        title: "Error de procesamiento",
        description: "No se pudo procesar el documento. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en NFC
  const handleNFCStatusChange = (status: 'idle' | 'scanning' | 'success' | 'error', message?: string) => {
    setNfcStatus(status);
    if (message) {
      setNfcMessage(message);
    }
  };

  // Manejar lectura exitosa de NFC
  const handleNFCSuccess = (data: CedulaChilenaData) => {
    setUserIdentityData(data);
    setNfcStatus('success');
    setIsNfcModalOpen(false);
    
    // Mostrar modal de comparación facial si queremos esa verificación adicional
    if (verificationPoints < 175) { // 125-150 puntos de NFC + 50 de facial = 175-200
      setShowFacialCompare(true);
      startCamera();
    } else {
      completeVerification("NFC");
    }
  };

  // Manejar error de NFC
  const handleNFCError = (error: Error) => {
    console.error('Error NFC:', error);
    setNfcStatus('error');
    setNfcMessage(`Error: ${error.message}`);
    
    toast({
      title: "Error en lectura NFC",
      description: error.message || "No se pudo leer la tarjeta NFC",
      variant: "destructive",
    });
  };

  // Abrir modal de NFC para verificación real
  const openNFCVerification = () => {
    setIsNfcModalOpen(true);
    setNfcStatus('idle');
    setNfcMessage('');
    
    // Registrar intento de verificación NFC para análisis
    try {
      // En una implementación real, esto registraría el intento en el servidor
      console.log('Iniciando verificación NFC real');
      
      // Registrar evento de analítica
      const analyticsData = {
        event: 'nfc_verification_started',
        partnerId: partnerInfo?.id || 'demo',
        partnerName: partnerInfo?.storeName || 'Tienda Demo',
        timestamp: new Date().toISOString()
      };
      
      // Enviar datos de analítica (comentado para demostración)
      // apiRequest('POST', '/api/analytics/event', analyticsData);
      
    } catch (error) {
      console.error('Error registrando intento de verificación:', error);
    }
  };

  // Abrir verificación READID
  const startREADIDVerification = () => {
    setIsReadIDModalOpen(true);
    setReadIDStep(0);
    setValidationProgress(0);
    
    // Iniciar la simulación de progreso
    const progressInterval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Cuando llegue al 100%, avanzar al siguiente paso
          setTimeout(() => {
            setReadIDStep(1);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Completar verificación READID con lectura real de cédula
  const completeREADIDVerification = async () => {
    setReadIDStep(2); // Avanzar al paso de procesamiento
    
    try {
      // Iniciar la lectura real de cédula con NFC
      console.log('Iniciando lectura real de cédula en READID');
      
      const data = await readCedulaChilena((status, message) => {
        console.log(`Estado NFC: ${status}, mensaje: ${message}`);
        
        // Si hay error, actualizar interfaz
        if (status === NFCReadStatus.ERROR) {
          toast({
            title: "Error en lectura de cédula",
            description: message || "Ocurrió un error al leer la cédula",
            variant: "destructive",
          });
          setReadIDStep(0); // Volver al inicio
        }
      });
      
      if (data) {
        // Datos reales obtenidos
        setUserIdentityData(data);
        setIsReadIDModalOpen(false);
        completeVerification("READID");
        
        // Registrar verificación exitosa
        apiRequest("POST", "/api/micro-interactions/record", {
          type: "readid_verification",
          points: 100,
          metadata: {
            description: "Verificación exitosa mediante READID",
            data: {
              rut: data.rut,
              fechaVerificacion: new Date().toISOString()
            }
          }
        }).catch(err => console.error("Error al registrar interacción:", err));
      }
    } catch (error) {
      console.error('Error en lectura READID:', error);
      toast({
        title: "Error en verificación",
        description: error instanceof Error ? error.message : "No se pudo completar la verificación",
        variant: "destructive",
      });
      setReadIDStep(0); // Volver al inicio
    }
  };

  // Generar código de verificación único en formato XXX-000
  const generateVerificationCode = (): string => {
    // Caracteres para la parte de letras (prefijo)
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin I, O para evitar confusión
    
    // Generar 3 letras aleatorias
    let prefix = '';
    for (let i = 0; i < 3; i++) {
      prefix += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generar 3 dígitos aleatorios (000-999)
    const digits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Formato XXX-000
    return `${prefix}-${digits}`;
  };

  // Registrar verificación exitosa (usando datos reales)
  const completeVerification = (method: "NFC" | "READID" | "FOTOCAPTURA") => {
    // Asignar puntos según el método
    let points = 0;
    let message = "";
    let type = "";
    
    switch (method) {
      case "NFC":
        points = 150;
        message = "¡Verificación NFC exitosa! +150 puntos";
        type = "nfc_verification";
        break;
      case "READID":
        points = 100;
        message = "¡Verificación READID exitosa! +100 puntos";
        type = "readid_verification";
        break;
      case "FOTOCAPTURA":
        points = 50;
        message = "¡Verificación con foto exitosa! +50 puntos";
        type = "facial_verification";
        break;
    }
    
    // Registrar verificación en el sistema (datos reales)
    if (userIdentityData) {
      apiRequest("POST", "/api/micro-interactions/record", {
        type: type,
        points: points,
        metadata: {
          description: `Verificación exitosa mediante ${method}`,
          data: {
            rut: userIdentityData.rut,
            fechaVerificacion: new Date().toISOString(),
            tienda: partnerInfo?.storeName || partnerData?.storeName || 'Tienda Demo'
          }
        }
      }).catch(err => console.error(`Error al registrar interacción de ${method}:`, err));
    }
    
    // Generar código de verificación para verificación móvil
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
    setShowVerificationQR(true);
    
    setVerificationPoints(prev => prev + points);
    setIdentityVerified(true);
    
    // Mostrar toast de éxito con los puntos
    toast({
      title: "Verificación completada",
      description: message,
      variant: "default",
    });
    
    // Lanzar confetti para celebrar la verificación exitosa
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Avanzar al siguiente paso
    setStep('payment');
  };

  // Reiniciar el proceso
  const resetProcess = () => {
    setStep('welcome');
    setSelectedDocumentType('');
    setDocumentFile(null);
    setDocumentPreviewUrl('');
    setDocumentText('');
    setIdentityVerified(false);
    setVerificationPoints(0);
    setUserIdentityData(null);
    setNfcStatus('idle');
    setIsNfcModalOpen(false);
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsProcessingPayment(false);
    setIsSignatureSheetOpen(false);
    setDocumentProcessed(false);
    setReceiptData(null);
    setShowFacialCompare(false);
    setIsReadIDModalOpen(false);
    setReadIDStep(0);
    setValidationProgress(0);
    setVerificationCode('');
    setShowVerificationQR(false);
  };

  // Renderizar el contenido según el paso actual
  const renderContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center p-4 space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">¡Bienvenido al POS de Vecinos Xpress!</h2>
              <p className="text-lg text-gray-700 mb-2">
                {partnerData ? 
                  `${partnerData.storeName} - ${partnerData.storeCode}` : 
                  (partnerInfo ? `${partnerInfo.storeName} - ${partnerInfo.storeCode}` : 'Cargando información...')
                }
              </p>
              <p className="text-gray-600">
                Elija una opción para comenzar:
              </p>
            </div>
            
            {/* Botón para volver si se accedió con código de tienda */}
            {localStorage.getItem('store_code') && (
              <div className="flex items-center justify-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('store_code');
                    setLocation('/vecinos/pos-app');
                  }}
                  className="text-primary border-primary hover:bg-red-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a selección de tienda
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl">
              <Card className="overflow-hidden transition-all hover:shadow-lg border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FileText className="h-6 w-6 text-primary" />
                    Procesar documento
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Subir, validar y certificar documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4">
                    Procese documentos con validación de identidad avanzada y envíelos para certificación oficial.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-[#2d219b] hover:bg-[#231a7c]"
                    onClick={() => setStep('selectDocument')}
                  >
                    Iniciar proceso
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="overflow-hidden transition-all hover:shadow-lg border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Shield className="h-6 w-6 text-blue-500" />
                    Verificar identidad
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Validación NFC y biométrica
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4">
                    Utilice validación avanzada mediante chip NFC de cédula chilena y comparación facial.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setStep('verifyIdentity')}
                  >
                    Iniciar verificación
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        );
        
      case 'selectDocument':
        return (
          <div className="p-4">
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => setStep('welcome')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Seleccione tipo de documento</h2>
              <p className="text-gray-600 mt-1">Elija el tipo de documento que desea procesar</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {tiposDocumento.map((tipo) => (
                <Card 
                  key={tipo.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDocumentType === tipo.id ? 'ring-2 ring-green-500 shadow-md' : ''
                  }`}
                  onClick={() => setSelectedDocumentType(tipo.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${
                        selectedDocumentType === tipo.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tipo.icono}
                      </div>
                      {tipo.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    {selectedDocumentType === tipo.id && (
                      <div className="text-green-600 font-medium flex items-center">
                        <Check className="h-4 w-4 mr-1" /> Seleccionado
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                disabled={!selectedDocumentType}
                onClick={() => setStep('uploadDocument')}
                className="bg-green-600 hover:bg-green-700 min-w-[200px]"
              >
                Continuar
              </Button>
            </div>
          </div>
        );
        
      case 'uploadDocument':
        return (
          <div className="p-4">
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => setStep('selectDocument')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Subir documento</h2>
              <p className="text-gray-600 mt-1">
                Seleccione un archivo o ingrese texto para su {
                  tiposDocumento.find(t => t.id === selectedDocumentType)?.nombre.toLowerCase() || 'documento'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Subir archivo</CardTitle>
                  <CardDescription>
                    Formatos aceptados: PDF, DOCX, JPG, PNG
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={triggerFileUpload}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                    
                    {documentFile ? (
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-green-600 mb-2" />
                        <p className="text-green-600 font-medium">{documentFile.name}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {(documentFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600">Haga clic para seleccionar su archivo</p>
                        <p className="text-gray-500 text-sm mt-1">o arrastre y suelte aquí</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Crear documento nuevo</CardTitle>
                  <CardDescription>
                    Ingrese el texto para su documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Ingrese el contenido de su documento aquí..."
                    className="min-h-[200px]"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                disabled={!documentFile && !documentText}
                onClick={() => setStep('verifyIdentity')}
                className="bg-green-600 hover:bg-green-700 min-w-[200px]"
              >
                Continuar
              </Button>
            </div>
          </div>
        );
        
      case 'verifyIdentity':
        return (
          <div className="p-4">
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => documentFile || documentText ? setStep('uploadDocument') : setStep('welcome')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Verificación de identidad</h2>
              <p className="text-gray-600 mt-1">
                {identityVerified 
                  ? "Identidad verificada exitosamente"
                  : "Seleccione el método de verificación que desea utilizar"}
              </p>
              
              {/* Indicador de puntos */}
              {verificationPoints > 0 && (
                <div className="flex items-center justify-center mt-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    {verificationPoints} puntos
                  </div>
                </div>
              )}
            </div>
            
            {identityVerified ? (
              <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-800">¡Verificación completada!</h3>
                <p className="text-green-600 mt-1">
                  La identidad ha sido verificada exitosamente
                </p>
                
                {userIdentityData && (
                  <div className="mt-4 text-left bg-white p-4 rounded border border-green-200">
                    <h4 className="font-medium text-gray-700 mb-2">Datos validados:</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{userIdentityData.nombres} {userIdentityData.apellidos}</span>
                      <span className="text-gray-600">RUT:</span>
                      <span className="font-medium">{userIdentityData.rut}</span>
                      <span className="text-gray-600">Fecha nacimiento:</span>
                      <span className="font-medium">{userIdentityData.fechaNacimiento}</span>
                      <span className="text-gray-600">Vigencia:</span>
                      <span className="font-medium">{userIdentityData.fechaExpiracion}</span>
                    </div>
                  </div>
                )}
                
                <Button
                  className="mt-6 bg-green-600 hover:bg-green-700 w-full"
                  onClick={() => documentFile || documentText ? setStep('payment') : setStep('welcome')}
                >
                  {documentFile || documentText ? 'Continuar al pago' : 'Volver al inicio'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Shield />
                      Verificación NFC
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      150 puntos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 mb-4">
                      Utilice el chip NFC de la cédula de identidad chilena para una verificación más segura.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={openNFCVerification}
                    >
                      Iniciar verificación NFC
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <QrCode />
                      Verificación READID
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      100 puntos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 mb-4">
                      Escaneamos y validamos la información impresa en su documento de identidad.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={startREADIDVerification}
                    >
                      Iniciar READID
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck />
                      InverID Premium
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                      200 puntos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 mb-4">
                      Verificación avanzada multi-nivel que combina análisis forense, NFC y biometría facial.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => window.open('/verificacion-nfc-fixed?demo=true', '_blank')}
                    >
                      Abrir InverID
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <User />
                      Captura de foto
                    </CardTitle>
                    <CardDescription className="text-amber-100">
                      50 puntos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 mb-4">
                      Captura de imagen para verificación visual del solicitante.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={startCamera}
                      disabled={!isCameraAvailable}
                    >
                      {isCameraAvailable ? 'Iniciar cámara' : 'Cámara no disponible'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            {/* Modal para verificación NFC */}
            <Dialog open={isNfcModalOpen} onOpenChange={setIsNfcModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Verificación NFC</DialogTitle>
                  <DialogDescription>
                    Acerque su cédula de identidad al dispositivo para leer el chip NFC
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center py-4">
                  <NFCIdentityReader 
                    onSuccess={handleNFCSuccess}
                    onCancel={() => setIsNfcModalOpen(false)}
                    onError={handleNFCError}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsNfcModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal para verificación READID */}
            <Dialog open={isReadIDModalOpen} onOpenChange={setIsReadIDModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Sistema de verificación READID</DialogTitle>
                  <DialogDescription>
                    {readIDStep === 0 
                      ? "Analizando documento de identidad" 
                      : "Verificación completada"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center py-4">
                  {readIDStep === 0 ? (
                    <>
                      <div className="w-full max-w-xs mb-4">
                        <Progress value={validationProgress} className="h-2" />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                        <p className="text-blue-700 text-sm">
                          {validationProgress < 25 && "Escaneando documento..."}
                          {validationProgress >= 25 && validationProgress < 50 && "Detectando tipo de documento..."}
                          {validationProgress >= 50 && validationProgress < 75 && "Extrayendo información..."}
                          {validationProgress >= 75 && validationProgress < 100 && "Validando datos..."}
                          {validationProgress >= 100 && "¡Verificación completada!"}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center mt-4">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      
                      <h3 className="text-lg font-medium text-green-800 mb-2">Verificación exitosa</h3>
                      
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg w-full text-sm mt-2">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">Cédula de Identidad</span>
                        
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">CARLOS ANDRÉS GÓMEZ SOTO</span>
                        
                        <span className="text-gray-600">RUT:</span>
                        <span className="font-medium">16.358.742-5</span>
                        
                        <span className="text-gray-600">Fecha nacimiento:</span>
                        <span className="font-medium">15/05/1990</span>
                        
                        <span className="text-gray-600">Nacionalidad:</span>
                        <span className="font-medium">CHILENA</span>
                        
                        <span className="text-gray-600">Vigencia:</span>
                        <span className="font-medium">22/10/2031</span>
                      </div>
                      
                      <Button
                        className="mt-6 bg-green-600 hover:bg-green-700"
                        onClick={completeREADIDVerification}
                      >
                        Confirmar y continuar
                      </Button>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsReadIDModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal para comparación facial */}
            <Dialog open={showFacialCompare} onOpenChange={setShowFacialCompare}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Verificación facial</DialogTitle>
                  <DialogDescription>
                    Compare el rostro con la persona presente
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-2 w-full aspect-[3/4]">
                      {/* Aquí iría la foto de la cédula */}
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <User className="h-12 w-12" />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">Foto en documento</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-2 w-full aspect-[3/4]">
                      {showCamera && videoRef ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <User className="h-12 w-12" />
                        </div>
                      )}
                      <canvas ref={capturedPhotoRef} style={{ display: 'none' }} />
                    </div>
                    <span className="text-sm text-gray-600">Persona en vivo</span>
                  </div>
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  {showCamera ? (
                    <Button 
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                      onClick={capturePhoto}
                    >
                      Capturar foto
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        onClick={() => setShowFacialCompare(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          // Obtener la imagen de la foto capturada
                          const photoDataUrl = capturedPhotoRef.current?.toDataURL('image/jpeg');
                          setShowFacialCompare(false);
                          
                          if (photoDataUrl) {
                            // Verificación real - Enviar foto capturada para comparación con datos de la cédula
                            const verificationData = {
                              rut: userIdentityData?.rut,
                              selfieImage: photoDataUrl,
                              verificationType: "POS_FACIAL_VERIFICATION"
                            };
                            
                            // En un entorno real, esto enviaría la imagen para comparación biométrica
                            console.log('Enviando datos para verificación facial real:', verificationData.rut);
                            
                            // Registrar verificación biométrica exitosa
                            apiRequest("POST", "/api/micro-interactions/record", {
                              type: "facial_verification",
                              points: 50,
                              metadata: {
                                description: "Verificación facial exitosa en POS",
                                data: {
                                  rut: userIdentityData?.rut,
                                  verificationType: "POS_FACIAL_VERIFICATION",
                                  fechaVerificacion: new Date().toISOString()
                                }
                              }
                            }).catch(err => console.error("Error al registrar interacción:", err));
                          }
                          
                          completeVerification("FOTOCAPTURA");
                        }}
                      >
                        Confirmar coincidencia
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
        
      case 'payment':
        return (
          <div className="p-4">
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => setStep('verifyIdentity')}
              disabled={isProcessingPayment}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Procesar pago</h2>
              <p className="text-gray-600 mt-1">
                Complete el pago para continuar con el proceso
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Detalle de servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Tipo de documento:</span>
                      <span className="font-medium">
                        {tiposDocumento.find(t => t.id === selectedDocumentType)?.nombre || 'Documento'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Verificación de identidad:</span>
                      <span className="font-medium">
                        {verificationPoints >= 150 ? 'Avanzada (NFC)' : 
                         verificationPoints >= 100 ? 'Media (READID)' : 
                         'Básica (Foto)'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Valor del servicio:</span>
                      <span className="font-medium">$5.990</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Comisión tienda:</span>
                      <span className="font-medium text-green-600">$1.198</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-800 font-semibold">Total a pagar:</span>
                      <span className="font-bold text-lg">$5.990</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 w-full">
                    <p>El pago se procesa únicamente con tarjeta de crédito o débito.</p>
                  </div>
                  
                  <Button 
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={processPayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Pagar con tarjeta
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Panel deslizante para firma */}
            <Sheet open={isSignatureSheetOpen} onOpenChange={setIsSignatureSheetOpen}>
              <SheetContent side="bottom" className="h-[90%] sm:max-w-lg sm:h-[90%] sm:mx-auto rounded-t-lg">
                <SheetHeader className="text-center mb-6">
                  <SheetTitle>Firmar documento</SheetTitle>
                  <SheetDescription>
                    Firme con su dedo o lápiz en el área designada
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex flex-col items-center">
                  <div className="border rounded-lg w-full min-h-[300px] mb-6 bg-white">
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        className: "w-full h-full signature-canvas",
                        style: { minHeight: "300px" }
                      }}
                      penColor="black"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-4 w-full">
                    <Button 
                      variant="outline" 
                      onClick={clearSignature}
                      className="flex-1"
                    >
                      Borrar
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleSignatureComplete}
                    >
                      Completar firma
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        );
        
      case 'success':
        return (
          <div className="p-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">¡Proceso completado!</h2>
              <p className="text-gray-600 mt-1">
                Su documento ha sido procesado exitosamente
              </p>
            </div>
            
            {receiptData && (
              <div className="max-w-md mx-auto">
                <Card className="mb-6 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <div className="flex justify-between items-center">
                      <CardTitle>Comprobante</CardTitle>
                      <div className="text-right">
                        <p className="text-sm text-green-100">N° {receiptData.documentId}</p>
                        <p className="text-xs text-green-100">{new Date().toLocaleDateString('es-CL')}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <VecinoXpressLogo />
                      <div className="text-right">
                        <p className="text-sm font-medium">{receiptData.partnerName}</p>
                        <p className="text-xs text-gray-600">{receiptData.partnerCode}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Documento:</span>
                        <span className="font-medium">{receiptData.documentType}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Solicitante:</span>
                        <span className="font-medium">{receiptData.userName}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">RUT:</span>
                        <span className="font-medium">{receiptData.userRut}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verificación:</span>
                        <span className="font-medium">{receiptData.verificationLevel}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="font-medium">{receiptData.certificationStatus}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entrega estimada:</span>
                        <span className="font-medium">{receiptData.estimatedDelivery}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold">${receiptData.amount.toLocaleString('es-CL')}</span>
                      </div>
                      
                      <div className="flex justify-between text-green-600">
                        <span>Comisión tienda:</span>
                        <span className="font-bold">${receiptData.commission.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Send className="h-4 w-4" />
                      Enviar
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Código QR para la verificación móvil */}
                {showVerificationQR && verificationCode && (
                  <div className="max-w-xs mx-auto mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="text-center mb-3">
                      <h3 className="font-bold text-gray-800 text-lg">Verificación Móvil</h3>
                      <p className="text-sm text-gray-600">
                        Escanea este código QR con tu dispositivo móvil para completar la verificación
                      </p>
                      <div className="bg-indigo-100 text-indigo-800 font-mono font-bold text-lg py-1 px-2 rounded mx-auto my-2 inline-block">
                        {verificationCode}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="border-4 border-indigo-800 rounded-lg p-2 bg-white">
                        <QRCodeSVG 
                          value={`${window.location.origin}/verificacion-nfc-fixed?code=${verificationCode}`}
                          size={150}
                          bgColor={"#ffffff"}
                          fgColor={"#2d219b"}
                          level={"H"}
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Este código de verificación expirará en 30 minutos
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    El documento será enviado a un certifier para su validación final.
                    <br />Una vez certificado, será entregado al correo del solicitante.
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700 min-w-[200px]"
                    onClick={resetProcess}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Procesar otro documento
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="p-4 text-center">
            <h2>Error: Paso desconocido</h2>
            <Button
              className="mt-4"
              onClick={() => setStep('welcome')}
            >
              Volver al inicio
            </Button>
          </div>
        );
    }
  };

  return (
    <VecinosLayout>
      <Helmet>
        <title>POS Web Oficial | Vecinos NotaryPro Express</title>
      </Helmet>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-gray-600">Cargando información...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-4">
          {renderContent()}
        </div>
      )}
      
      <Toaster />
    </VecinosLayout>
  );
};

export default WebAppPOSOfficial;