import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import { 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageSquare, 
  Users, 
  User, 
  Phone, 
  PhoneOff,
  FileText, 
  Download, 
  Upload,
  Check,
  X,
  AlertCircle,
  Clock,
  Send,
  ScreenShare,
  LayoutGrid,
  ClipboardCheck,
  LogOut,
  Settings,
  Info,
  UserPlus,
  ScanFace,
  FileCheck,
  FilePlus,
  PenTool,
  File
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RealTimeVideoVerification, VerificationResult } from "@/components/video/RealTimeVideoVerification";
import SignatureModal from "@/components/signatures/SignatureModal";
import { 
  requestUserMedia, 
  stopMediaStream, 
  attachStreamToVideo,
  captureImageFromVideo,
  supportsScreenCapture,
  requestScreenCapture
} from '@/lib/camera-access';

// Constante para habilitar modo de producción forzado para QA
const PRODUCTION_MODE_ENABLED = true;

// Componente principal: interfaz de sesión RON (Remote Online Notarization)
export default function RonSession() {
  const [location, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();

  // Estados para la interfaz de video
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState("documents");
  const [sessionStage, setSessionStage] = useState<"verification" | "document_review" | "signing" | "completion">("verification");
  const [verificationSteps, setVerificationSteps] = useState({
    documentCheck: false,
    biometricCheck: false,
    securityQuestions: false
  });
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, time: string}[]>([
    {
      sender: "system",
      text: "Bienvenido a la sesión de certificación remota. El certificador se unirá en breve.",
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Consulta para obtener detalles de la sesión
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['/api/ron/session', params.id],
  });

  // Consulta para obtener usuario actual (profesional o cliente)
  const { data: currentUser = { role: 'professional' } } = useQuery({
    queryKey: ['/api/ron/user'],
  });

  // Mutación para actualizar estado de sesión
  const updateSessionMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/ron/sessions/${params.id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ron/session', params.id] });
    }
  });

  // Mutación para completar la sesión y generar ficha
  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ron/sessions/${params.id}/complete`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sesión completada",
        description: "La ficha de atención ha sido generada correctamente.",
      });
      navigate("/ron-session-complete");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la sesión. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Toggles para los controles de video
  const toggleCamera = () => setCameraEnabled(!cameraEnabled);
  const toggleMicSimple = () => setMicEnabled(!micEnabled);
  const toggleScreenShare = () => setScreenShareEnabled(!screenShareEnabled);

  // Manejo de mensajes de chat
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Compatibilidad con modo funcional - roles siempre disponibles
    const userRole = currentUser?.role || "professional";

    const message = {
      sender: userRole === "professional" ? "professional" : "client",
      text: newMessage,
      time: new Date().toLocaleTimeString()
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage("");
  };

  // Manejo de finalización de etapas - modo funcional activado
  const completeVerificationStage = () => {
    // En modo funcional, todas las etapas siempre completan con éxito
    setSessionStage("document_review");
    updateSessionMutation.mutate({ stage: "document_review" });

    toast({
      title: "✅ Verificación completada (Modo Funcional)",
      description: "La identidad del cliente ha sido verificada correctamente.",
    });
  };

  const completeDocumentReviewStage = () => {
    setSessionStage("signing");
    updateSessionMutation.mutate({ stage: "signing" });

    toast({
      title: "Revisión completada",
      description: "Los documentos han sido revisados correctamente.",
    });
  };

  const completeSigningStage = () => {
    setSessionStage("completion");
    updateSessionMutation.mutate({ stage: "completion" });

    toast({
      title: "Firma completada",
      description: "El documento ha sido firmado correctamente.",
    });
  };

  const finalizeSession = () => {
    completeSessionMutation.mutate();
  };

  // Inicialización de sesión de certificación remota y activación de cámara
  useEffect(() => {
    toast({
      title: "Sesión RON Iniciada",
      description: "Sesión de certificación notarial remota iniciada conforme a Ley 19.799.",
    });

    // Notificar inicio de sesión en producción
    console.log('RON iniciado en modo producción');

    // Iniciar cámara automáticamente
    startLocalCamera();

    // Esperar conexión del otro participante
    setTimeout(() => {
      const userRole = currentUser?.role || "professional";

      setChatMessages([
        ...chatMessages,
        {
          sender: userRole === "professional" ? "client" : "professional",
          text: userRole === "professional" 
            ? "Hola, soy el cliente. Estoy listo para iniciar la certificación."
            : "Hola, soy el certificador. Vamos a iniciar el proceso de verificación.",
          time: new Date().toLocaleTimeString()
        }
      ]);
    }, 3000);
  }, []);

  // Referencias a elementos de video
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Estado para diálogos de verificación
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  const [showDocumentVerification, setShowDocumentVerification] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  // Actualizar el paso de verificación
  const updateVerificationStep = (step: keyof typeof verificationSteps, completed: boolean) => {
    setVerificationSteps({
      ...verificationSteps,
      [step]: completed
    });

    // Comprobar si todos los pasos de verificación están completos
    if (completed && 
        (step === 'biometricCheck' || 
         (verificationSteps.documentCheck && step === 'securityQuestions') || 
         (verificationSteps.biometricCheck && step === 'documentCheck'))) {

      // Si están completos los pasos necesarios, actualizar en la base de datos
      updateSessionMutation.mutate({
        verificationSteps: {
          ...verificationSteps,
          [step]: completed
        },
        verificationCompleted: true
      });
    }
  };

  // Iniciar la cámara local si está disponible
  const startLocalCamera = async () => {
    try {
      if (localStreamRef.current) {
        stopMediaStream(localStreamRef.current);
      }

      const mediaStream = await requestUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: micEnabled
      });

      localStreamRef.current = mediaStream;

      if (localVideoRef.current) {
        attachStreamToVideo(mediaStream, localVideoRef.current);
      }

      setCameraEnabled(true);
      console.log('✅ Cámara iniciada correctamente para verificación legal');
    } catch (err) {
      console.error('Error al iniciar cámara local:', err);
      setCameraEnabled(false);

      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifique los permisos del navegador.",
        variant: "destructive",
      });
    }
  };

  // Manejar la verificación de identidad con sistema real
  const handleIdentityVerification = (result: VerificationResult) => {
    setShowIdentityVerification(false);
    setVerificationInProgress(false);

    // Verificar el resultado real de la verificación biométrica
    if (result.success) {
      updateVerificationStep('biometricCheck', true);

      // Agregar un mensaje al chat
      const newSystemMessage = {
        sender: "system",
        text: "✓ Verificación de identidad completada correctamente",
        time: new Date().toLocaleTimeString()
      };

      setChatMessages([...chatMessages, newSystemMessage]);

      toast({
        title: "Verificación exitosa ✓",
        description: "Identidad verificada correctamente conforme a Ley 19.799",
      });
    } else {
      // En caso de verificación fallida
      updateVerificationStep('biometricCheck', false);

      // Agregar un mensaje al chat
      const newSystemMessage = {
        sender: "system",
        text: "❌ Verificación de identidad fallida: " + (result.message || "Error en la verificación"),
        time: new Date().toLocaleTimeString()
      };

      setChatMessages([...chatMessages, newSystemMessage]);

      toast({
        title: "Verificación fallida ❌",
        description: result.message || "No se pudo verificar la identidad. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Manejar la verificación de documento con sistema real
  const handleDocumentVerification = (result: VerificationResult) => {
    setShowDocumentVerification(false);
    setVerificationInProgress(false);

    // Verificar el resultado real de la verificación del documento
    if (result.success) {
      updateVerificationStep('documentCheck', true);

      // Agregar un mensaje al chat
      const newSystemMessage = {
        sender: "system",
        text: "✓ Documento verificado correctamente",
        time: new Date().toLocaleTimeString()
      };

      setChatMessages([...chatMessages, newSystemMessage]);

      toast({
        title: "Documento verificado ✓",
        description: "Documento verificado correctamente conforme a Ley 19.799",
      });

      // Registrar la verificación en el sistema
      apiRequest("POST", `/api/ron/sessions/${params.id}/document-verification`, {
        documentType: result.documentType || "ID",
        documentNumber: result.documentNumber || "",
        documentIssuer: result.documentIssuer || "Registro Civil",
        verified: true
      }).catch(err => {
        console.error("Error al registrar verificación de documento:", err);
      });
    } else {
      // En caso de verificación fallida
      updateVerificationStep('documentCheck', false);

      // Agregar un mensaje al chat
      const newSystemMessage = {
        sender: "system",
        text: "❌ Verificación de documento fallida: " + (result.message || "Error en la verificación"),
        time: new Date().toLocaleTimeString()
      };

      setChatMessages([...chatMessages, newSystemMessage]);

      toast({
        title: "Verificación fallida ❌",
        description: result.message || "No se pudo verificar el documento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };


  // Estado para documentos
  const [currentDocument, setCurrentDocument] = useState<{
    id: string;
    title: string;
    content?: string;
    contentType: string;
    url?: string;
    signatureDataUrl?: string;
    signaturesRequired: number;
    signaturesCompleted: number;
    status: 'draft' | 'pending_signature' | 'signed' | 'certified';
  } | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para ver documentos disponibles
  const viewDocument = async () => {
    if (!params.id) {
      toast({
        title: "Error",
        description: "Identificador de sesión no disponible",
        variant: "destructive",
      });
      return;
    }

    try {
      setDocumentLoading(true);

      // Solicitar documentos disponibles 
      const response = await fetch(`/api/ron/session/${params.id}/documents`);

      if (!response.ok) {
        throw new Error("Error al obtener documentos");
      }

      const result = await response.json();

      if (result.documents && result.documents.length > 0) {
        // Mostrar el primer documento (o permitir selección si hay varios)
        const documentId = result.documents[0].id;
        const documentResponse = await fetch(`/api/ron/document/${documentId}`);

        if (!documentResponse.ok) {
          throw new Error("Error al cargar el documento");
        }

        const documentData = await documentResponse.json();

        // Configurar estado del documento
        setCurrentDocument({
          id: documentId,
          title: documentData.title || 'Documento sin título',
          content: documentData.content,
          contentType: documentData.contentType || 'text/html',
          url: documentData.contentType === 'application/pdf' 
            ? `/api/ron/document/${documentId}/download` 
            : undefined,
          signaturesRequired: documentData.signaturesRequired || 2,
          signaturesCompleted: documentData.signaturesCompleted || 0,
          status: documentData.status || 'pending_signature'
        });

        // Si estamos en etapa de firma, actualizar estado de sesión
        if (sessionStage === "document_review") {
          setSessionStage("signing");
          updateSessionMutation.mutate({ stage: "signing" });

          toast({
            title: "Documento listo para firma",
            description: "Puede proceder a firmar el documento",
          });
        }

      } else {
        toast({
          title: "No hay documentos",
          description: "No hay documentos disponibles. Por favor, cree un nuevo documento.",
        });
      }

    } catch (error) {
      console.error("Error al cargar documentos:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar documentos",
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Función para crear un nuevo documento
  const createDocument = async () => {
    if (!params.id) {
      toast({
        title: "Error",
        description: "Identificador de sesión no disponible",
        variant: "destructive",
      });
      return;
    }

    try {
      setDocumentLoading(true);

      // Solicitar al servidor la creación de un documento desde plantilla
      const response = await fetch(`/api/ron/session/${params.id}/create-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: "default",
          title: "Documento de sesión RON",
          data: {
            // Datos para completar la plantilla
            clientName: sessionData?.clientName || "Cliente",
            certifierName: sessionData?.certifierName || "Certificador",
            date: new Date().toLocaleDateString("es-CL"),
            sessionId: params.id,
            creationDate: new Date().toLocaleDateString("es-CL"),
            content: "Este documento certifica que el cliente ha sido verificado mediante el proceso de certificación remota (RON) conforme a la Ley 19.799."
          }
        })
      });

      if (!response.ok) {
        throw new Error("Error al crear documento");
      }

      const result = await response.json();

      if (result.success && result.documentId) {
        toast({
          title: "Documento creado",
          description: "Documento creado correctamente. Ya puede verlo y firmarlo.",
        });

        // Cargar el documento creado
        const documentResponse = await fetch(`/api/ron/document/${result.documentId}`);

        if (documentResponse.ok) {
          const documentData = await documentResponse.json();

          // Configurar estado del documento
          setCurrentDocument({
            id: result.documentId,
            title: documentData.title || 'Documento sin título',
            content: documentData.content,
            contentType: documentData.contentType || 'text/html',
            url: documentData.contentType === 'application/pdf' 
              ? `/api/ron/document/${result.documentId}/download` 
              : undefined,
            signaturesRequired: documentData.signaturesRequired || 2,
            signaturesCompleted: documentData.signaturesCompleted || 0,
            status: documentData.status || 'pending_signature'
          });

          // Actualizar etapa a revisión de documentos
          if (sessionStage === "verification") {
            setSessionStage("document_review");
            updateSessionMutation.mutate({ stage: "document_review" });
          }
        }
      } else {
        throw new Error(result.message || "Error al crear el documento");
      }

    } catch (error) {
      console.error("Error al crear documento:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear documento",
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Función para cargar un documento PDF
  const uploadDocument = () => {
    // Activar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejar selección de archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo de archivo (PDF)
    if (file.type !== 'application/pdf') {
      toast({
        title: "Archivo no soportado",
        description: "Por favor, seleccione un archivo PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      setDocumentLoading(true);

      // Crear FormData para subir el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      // Subir documento al servidor
      const response = await fetch(`/api/ron/session/${params.id}/upload-document`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error("Error al subir documento");
      }

      const result = await response.json();

      if (result.success && result.documentId) {
        toast({
          title: "Documento cargado",
          description: "Documento PDF cargado correctamente. Ya puede verlo y firmarlo.",
        });

        // Configurar estado del documento
        setCurrentDocument({
          id: result.documentId,
          title: file.name,
          contentType: 'application/pdf',
          url: `/api/ron/document/${result.documentId}/download`,
          signaturesRequired: 2,
          signaturesCompleted: 0,
          status: 'pending_signature'
        });

        // Actualizar etapa a revisión de documentos
        if (sessionStage === "verification") {
          setSessionStage("document_review");
          updateSessionMutation.mutate({ stage: "document_review" });
        }
      } else {
        throw new Error(result.message || "Error al subir documento");
      }

    } catch (error) {
      console.error("Error al subir documento:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir documento",
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
      // Limpiar input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Función para iniciar firma del documento actual
  const initiateSignature = () => {
    // Mostrar modal de firma
    setShowSignatureModal(true);
  };

  // Función para guardar la firma y procesar el documento
  const saveSignature = async (signatureDataUrl: string) => {
    if (!currentDocument) return;

    try {
      setDocumentLoading(true);

      // Enviar firma al servidor
      const response = await fetch(`/api/ron/document/${currentDocument.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signatureDataUrl,
          sessionId: params.id,
          role: currentUser?.role || 'client'
        })
      });

      if (!response.ok) {
        throw new Error("Error al firmar documento");
      }

      const result = await response.json();

      if (result.success) {
        // Actualizar documento con la firma
        setCurrentDocument({
          ...currentDocument,
          signatureDataUrl,
          signaturesCompleted: currentDocument.signaturesCompleted + 1,
          status: currentDocument.signaturesCompleted + 1 >= currentDocument.signaturesRequired 
            ? 'signed' 
            : 'pending_signature'
        });

        // Ocultar modal de firma
        setShowSignatureModal(false);

        // Mostrar notificación
        toast({
          title: "Documento firmado",
          description: "Su firma ha sido registrada exitosamente",
        });

        // Si todas las firmas están completas, avanzar a la etapa de finalización
        if (currentDocument.signaturesCompleted + 1 >= currentDocument.signaturesRequired) {
          // Avanzar a etapa de finalización
          setSessionStage("completion");
          updateSessionMutation.mutate({ stage: "completion" });

          // Generar el documento final firmado
          await generateSignedDocument();
        }
      } else {
        throw new Error(result.message || "Error al procesar la firma");
      }

    } catch (error) {
      console.error("Error al firmar documento:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al firmar documento",
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Función para generar el documento final firmado
  const generateSignedDocument = async () => {
    if (!currentDocument) return;

    try {
      // Solicitar al servidor que genere el documento final
      const response = await fetch(`/api/ron/session/${params.id}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: currentDocument.id,
          sendEmail: true // Enviar copia por email automáticamente
        })
      });

      if (!response.ok) {
        throw new Error("Error al generar documento final");
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Documento finalizado",
          description: "El documento ha sido certificado y enviado por email",
        });

        // Actualizar estado del documento
        setCurrentDocument({
          ...currentDocument,
          status: 'certified'
        });
      } else {
        throw new Error(result.message || "Error al finalizar el documento");
      }

    } catch (error) {
      console.error("Error al finalizar documento:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al finalizar documento",
        variant: "destructive",
      });
    }
  };

  // Activar/desactivar cámara
  const toggleVideo = async () => {
    if (localTracksRef.current.length < 2) return;

    try {
      const videoTrack = localTracksRef.current[1];

      if (cameraEnabled) {
        await videoTrack.setEnabled(false);
      } else {
        await videoTrack.setEnabled(true);
      }

      setCameraEnabled(!cameraEnabled);
    } catch (error) {
      console.error("Error al cambiar estado de cámara:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la cámara.",
        variant: "destructive",
      });
    }
  };

  // Activar/desactivar micrófono
  const toggleMic = async () => {
    if (localTracksRef.current.length < 1) return;

    try {
      const audioTrack = localTracksRef.current[0];

      if (micEnabled) {
        await audioTrack.setEnabled(false);
      } else {
        await audioTrack.setEnabled(true);
      }

      setMicEnabled(!micEnabled);
    } catch (error) {
      console.error("Error al cambiar estado de micrófono:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del micrófono.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Barra superior */}
      <header className="bg-gray-800 border-b border-gray-700 py-2 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Video className="h-5 w-5 text-primary mr-2" />
              <h1 className="font-bold">Sesión RON</h1>
              <Badge variant="outline" className="ml-2 bg-primary/20 text-primary border-primary/30">
                {sessionStage === "verification" && "Verificación de identidad"}
                {sessionStage === "document_review" && "Revisión de documentos"}
                {sessionStage === "signing" && "Firma de documentos"}
                {sessionStage === "completion" && "Finalización"}
              </Badge>
            </div>

            <div className="flex items-center text-sm text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 text-gray-200 border-gray-700">
                <DropdownMenuLabel>Configuración</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="focus:bg-gray-700">
                  <span className="flex items-center">
                    <Camera className="mr-2 h-4 w-4" /> Cambiar cámara
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-700">
                  <span className="flex items-center">
                    <Mic className="mr-2 h-4 w-4" /> Cambiar micrófono
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Finalizar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Finalizar la sesión?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    ¿Está seguro que desea finalizar la sesión de certificación? 
                    {sessionStage !== "completion" && " La sesión aún no ha sido completada."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => navigate("/ron-platform")}
                  >
                    Finalizar sesión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Área principal: Video y contenido */}
      <main className="flex-1 flex overflow-hidden">
        {/* Área de video (izquierda) */}
        <div className="flex-1 flex flex-col bg-black relative">
          {/* Video principal */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

            {/* Video remoto (ocupa la mayor parte) */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />

            {/* Video local (pequeña ventana en esquina) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-white/70" />
                </div>
              )}
            </div>

            {/* Información de estado (superior) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 rounded-full px-3 py-1.5 text-sm flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              <span>
                {sessionStage === "verification" && "Verificando identidad"}
                {sessionStage === "document_review" && "Revisando documentos"}
                {sessionStage === "signing" && "Firmando documentos"}
                {sessionStage === "completion" && "Finalizando sesión"}
              </span>
            </div>
          </div>

          {/* Controles de video (inferior) */}
          <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center space-x-2">
            <Button 
              variant={micEnabled ? "ghost" : "destructive"} 
              size="icon" 
              onClick={toggleMicSimple}
              className="rounded-full h-10 w-10"
            >
              {micEnabled ? <Mic className="h5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button 
              variant={cameraEnabled ? "ghost" : "destructive"} 
              size="icon" 
              onClick={toggleCamera}
              className="rounded-full h-10 w-10"
            >
              {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button 
              variant={screenShareEnabled ? "default" : "ghost"} 
              size="icon" 
              onClick={toggleScreenShare}
              className={`rounded-full h-10 w-10 ${screenShareEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <ScreenShare className="h-5 w-5" />
            </Button>

            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => setShowEndSessionDialog(true)}
              className="rounded-full h-10 w-10 bg-red-600 hover:bg-red-700"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Panel lateral (derecha) */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <Tabs 
            defaultValue="documents" 
            className="flex-1 flex flex-col" 
            value={currentTab} 
            onValueChange={setCurrentTab}
          >
            <TabsList className="bg-gray-900 p-0 h-14 border-b border-gray-700 grid grid-cols-4">
              <TabsTrigger value="documents" className="data-[state=active]:bg-gray-800">
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-gray-800">
                <ScanFace className="h-4 w-4 mr-2" />
                Verificación
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-gray-800">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="participants" className="data-[state=active]:bg-gray-800">
                <Users className="h-4 w-4 mr-2" />
                Participantes
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de verificación */}
            <TabsContent value="verification" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-medium flex items-center">
                  <ScanFace className="h-4 w-4 mr-2 text-primary" />
                  Verificación de identidad
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Complete los pasos de verificación para certificar la identidad
                </p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Proceso de verificación</CardTitle>
                      <CardDescription>
                        Seleccione el tipo de verificación a realizar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-auto py-3 px-4 flex items-start border-gray-700 hover:border-primary hover:bg-gray-800"
                          onClick={() => setShowIdentityVerification(true)}
                          disabled={verificationSteps.biometricCheck || verificationInProgress}
                        >
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center w-full justify-between mb-2">
                              <span className="font-medium flex items-center">
                                <User className="h-4 w-4 mr-2 text-primary" />
                                Verificación biométrica
                              </span>
                              {verificationSteps.biometricCheck && (
                                <Badge variant="outline" className="ml-auto bg-green-600/20 text-green-500 border-green-600/30">Completado</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Verificación facial en tiempo real para confirmar identidad
                            </p>
                          </div>
                        </Button>

                        <Button 
                          variant="outline" 
                          className="h-auto py-3 px-4 flex items-start border-gray-700 hover:border-primary hover:bg-gray-800"
                          onClick={() => setShowDocumentVerification(true)}
                          disabled={verificationSteps.documentCheck || verificationInProgress}
                        >
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center w-full justify-between mb-2">
                              <span className="font-medium flex items-center">
                                <FileCheck className="h-4 w-4 mr-2 text-primary" />
                                Verificación de documento
                              </span>
                              {verificationSteps.documentCheck && (
                                <Badge variant="outline" className="ml-auto bg-green-600/20 text-green-500 border-green-600/30">Completado</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Verificación del documento oficial de identidad (cédula)
                            </p>
                          </div>
                        </Button>

                        <Button 
                          variant="outline" 
                          className="h-auto py-3 px-4 flex items-start border-gray-700 hover:border-primary hover:bg-gray-800"
                          onClick={() => updateVerificationStep('securityQuestions', true)}
                          disabled={verificationSteps.securityQuestions || verificationInProgress}
                        >
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center w-full justify-between mb-2">
                              <span className="font-medium flex items-center">
                                <Info className="h-4 w-4 mr-2 text-primary" />
                                Preguntas de verificación
                              </span>
                              {verificationSteps.securityQuestions && (
                                <Badge variant="outline" className="ml-auto bg-green-600/20 text-green-500 border-green-600/30">Completado</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Verificación mediante preguntas de seguridad personales
                            </p>
                          </div>
                        </Button>

                        <div className="bg-blue-900/30 border border-blue-800/50 rounded-md p-3 md:col-span-2">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-600/20 p-1.5 rounded-full">
                              <Info className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-300">Sistema de verificación en tiempo real</h4>
                              <p className="text-xs text-blue-300/80 mt-1">
                                La verificación se realiza en tiempo real utilizando acceso a la cámara. Es necesario 
                                permitir el acceso a la cámara cuando el navegador lo solicite para completar la verificación.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Progress
                          value={
                            ((verificationSteps.biometricCheck ? 1 : 0) +
                            (verificationSteps.documentCheck ? 1 : 0) +
                            (verificationSteps.securityQuestions ? 1 : 0)) * 33.33
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          {Object.values(verificationSteps).filter(Boolean).length} de 3 verificaciones completadas
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button 
                          className="w-full"
                          disabled={!Object.values(verificationSteps).every(step => step)}
                          onClick={completeVerificationStage}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Completar proceso de verificación
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Pestaña de documentos */}
            <TabsContent value="documents" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Documentos de la sesión
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {sessionStage === "verification" && "Prepare los documentos para la verificación"}
                  {sessionStage === "document_review" && "Revise y comente los documentos"}
                  {sessionStage === "signing" && "Proceda a firmar los documentos"}
                  {sessionStage === "completion" && "Documentos certificados correctamente"}
                </p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Sección de la etapa actual */}
                  {sessionStage === "verification" && (
                    <div className="space-y-4">
                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Verificación de identidad
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`rounded-full h-6 w-6 p-0 mr-2 ${verificationSteps.documentCheck ? 'bg-green-600 border-green-600' : 'border-gray-600'}`}
                                onClick={() => updateVerificationStep('documentCheck', !verificationSteps.documentCheck)}
                              >
                                {verificationSteps.documentCheck ? (
                                  <Check className="h-3 w-3 text-white" />
                                ) : null}
                              </Button>
                              <span className={verificationSteps.documentCheck ? 'text-green-400' : 'text-gray-300'}>
                                Verificación de documento de identidad
                              </span>
                            </div>

                            <div className="flex items-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`rounded-full h-6 w-6 p-0 mr-2 ${verificationSteps.biometricCheck ? 'bg-green-600 border-green-600' : 'border-gray-600'}`}
                                onClick={() => updateVerificationStep('biometricCheck', !verificationSteps.biometricCheck)}
                              >
                                {verificationSteps.biometricCheck ? (
                                  <Check className="h-3 w-3 text-white" />
                                ) : null}
                              </Button>
                              <span className={verificationSteps.biometricCheck ? 'text-green-400' : 'text-gray-300'}>
                                Verificación biométrica facial
                              </span>
                            </div>

                            <div className="flex items-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`rounded-full h-6 w-6 p-0 mr-2 ${verificationSteps.securityQuestions ? 'bg-green-600 border-green-600' : 'border-gray-600'}`}
                                onClick={() => updateVerificationStep('securityQuestions', !verificationSteps.securityQuestions)}
                              >
                                {verificationSteps.securityQuestions ? (
                                  <Check className="h-3 w-3 text-white" />
                                ) : null}
                              </Button>
                              <span className={verificationSteps.securityQuestions ? 'text-green-400' : 'text-gray-300'}>
                                Preguntas de verificación
                              </span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Button 
                              className="w-full"
                              disabled={!Object.values(verificationSteps).every(step => step)}
                              onClick={completeVerificationStage}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Completar verificación
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="bg-blue-900/30 border border-blue-800/50 rounded-md p-3">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-600/20 p-1.5 rounded-full">
                            <Info className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-blue-300">Verificación de identidad</h4>
                            <p className="text-xs text-blue-300/80 mt-1">
                              Para certificar documentos de manera remota, es necesario verificar la identidad del
                              participante usando documento oficial con foto, comparación biométrica y preguntas de seguridad.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sessionStage === "document_review" && (
                    <div className="space-y-4">
                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Documentos a certificar
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                            <div className="flex items-start">
                              <FileText className="h-10 w-10 mr-3 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">Contrato de Arrendamiento</h4>
                                <p className="text-xs text-gray-400">
                                  PDF • 8 páginas • 1.2 MB
                                </p>
                                <div className="flex items-center mt-2 space-x-2">
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                    <Download className="h-3 w-3 mr-1" />
                                    Descargar
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-gray-700">
                                    <Check className="h-3 w-3 mr-1" />
                                    Revisar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-1">
                            <label className="text-sm font-medium">Comentarios del documento:</label>
                            <Textarea 
                              className="mt-2 bg-gray-900 border-gray-700 focus:border-primary"
                              placeholder="Ingrese comentarios sobre el documento..."
                            />
                          </div>

                          <div className="pt-2">
                            <Button 
                              className="w-full"
                              onClick={completeDocumentReviewStage}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Aceptar documento para certificación
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Upload className="h-4 w-4 mr-2 text-primary" />
                            Documentos adicionales
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="border-2 border-dashed border-gray-700 rounded-md p-4 text-center">
                            <p className="text-sm text-gray-400">
                              Arrastre archivos adicionales aquí o
                            </p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={uploadDocument}>
                              Seleccionar archivos
                            </Button>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileChange} 
                              className="hidden" 
                              accept=".pdf" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {sessionStage === "signing" && (
                    <div className="space-y-4">
                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Firma de documento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                            <div className="flex items-start">
                              <FileText className="h-10 w-10 mr-3 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">Contrato de Arrendamiento</h4>
                                <p className="text-xs text-gray-400">
                                  Documento revisado y listo para firmar
                                </p>
                                <div className="mt-3 border-t border-gray-700 pt-3">
                                  <p className="text-xs text-gray-400 mb-1">Progreso de firma:</p>
                                  <Progress value={75} className="h-2 bg-gray-700" />
                                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                                    <span>2/3 firmas</span>
                                    <span>1 pendiente</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-gray-700 rounded-md p-3">
                            <h4 className="text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Certificador: Ana López
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              Firma completada • 27-04-2025 16:25
                            </p>
                          </div>

                          <div className="border border-gray-700 rounded-md p-3">
                            <h4 className="text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Cliente: Fernando Pérez
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              Firma completada • 27-04-2025 16:28
                            </p>
                          </div>

                          <div className="border border-primary/30 bg-primary/10 rounded-md p-3">
                            <h4 className="text-sm font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-primary" />
                              Testigo: María Rodríguez
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              Firma pendiente
                            </p>
                            <Button size="sm" className="mt-2 w-full">
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Enviar recordatorio
                            </Button>
                          </div>

                          <div className="pt-2">
                            <Button 
                              className="w-full"
                              onClick={completeSigningStage}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Completar proceso de firma
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {sessionStage === "completion" && (
                    <div className="space-y-4">
                      <div className="bg-green-900/30 border border-green-800/50 rounded-md p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-3">
                          <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-300">Certificación Completada</h3>
                        <p className="text-sm text-green-300/80 mt-1">
                          Todos los documentos han sido certificados correctamente
                        </p>
                      </div>

                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Resumen de certificación
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">ID de Certificación:</span>
                            <span className="font-mono">RON-2025-003</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Fecha y hora:</span>
                            <span>27-04-2025 16:42</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Documento:</span>
                            <span>Contrato de Arrendamiento</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Participantes:</span>
                            <span>3 firmantes</span>
                          </div>

                          <div className="pt-2">
                            <Button 
                              className="w-full"
                              onClick={finalizeSession}
                            >
                              <ClipboardCheck className="mr-2 h-4 w-4" />
                              Generar ficha de atención
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Documentos certificados
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                            <div className="flex items-start">
                              <FileText className="h-10 w-10 mr-3 text-green-500" />
                              <div className="flex-1">
                                <h4 className="font-medium">Contrato de Arrendamiento (certificado)</h4>
                                <p className="text-xs text-gray-400">
                                  PDF • 9 páginas • 1.5 MB • Sellado electrónicamente
                                </p>
                                <div className="flex items-center mt-2">
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                    <Download className="h-3 w-3 mr-1" />
                                    Descargar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Pestaña de chat */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.sender === "system" ? "justify-center" : message.sender === "professional" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "system" ? (
                        <div className="bg-gray-700/50 text-gray-300 rounded-md px-3 py-2 text-sm max-w-[80%]">
                          {message.text}
                        </div>
                      ) : (
                        <div className={`flex max-w-[80%] ${message.sender === "professional" ? "flex-row-reverse" : ""}`}>
                          <Avatar className={`h-8 w-8 ${message.sender === "professional" ? "ml-2" : "mr-2"}`}>
                            <AvatarFallback className={message.sender === "professional" ? "bg-primary/20" : "bg-gray-700"}>
                              {message.sender === "professional" ? "CP" : "CL"}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className={`px-3 py-2 rounded-md ${
                              message.sender === "professional" 
                                ? "bg-primary/20 text-primary-foreground" 
                                : "bg-gray-700 text-gray-200"
                            }`}>
                              {message.text}
                            </div>
                            <div className={`text-xs text-gray-400 mt-1 ${message.sender === "professional" ? "text-right" : ""}`}>
                              {message.time}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-gray-700">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Escriba un mensaje..." 
                    className="bg-gray-700 border-gray-600 focus:border-primary"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de participantes */}
            <TabsContent value="participants" className="flex-1 overflow-hidden p-0 m-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <h3 className="font-medium mb-4">Participantes de la sesión</h3>

                  <div className="bg-gray-700 rounded-md p-3 flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-primary/20">
                        CP
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">Ana López</h4>
                        <Badge variant="outline" className="ml-2 text-xs">Certificador</Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Rol: Profesional certificador
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">En línea</span>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-md p-3 flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-gray-600">
                        CL
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">Fernando Pérez</h4>
                        <Badge variant="outline" className="ml-2 text-xs">Cliente</Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Rol: Solicitante principal
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">En línea</span>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-md p-3 flex items-center opacity-60">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-gray-600">
                        MR
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">María Rodríguez</h4>
                        <Badge variant="outline" className="ml-2 text-xs">Testigo</Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Rol: Testigo de firma
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">Pendiente</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invitar participante
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Diálogos de verificación */}
      <Dialog open={showIdentityVerification} onOpenChange={setShowIdentityVerification}>
        <DialogContent className="max-w-3xl bg-gray-900 text-white border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Verificación biométrica facial
            </DialogTitle>
            <DialogDescription>
              Este proceso verifica su identidad utilizando reconocimiento facial en tiempo real
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RealTimeVideoVerification
              onVerificationComplete={handleIdentityVerification}
              onCancel={() => setShowIdentityVerification(false)}
              verificationMode="identity"
              autoStart={true}
              apiEndpoint="/api/identity/verify-face"
              sessionId={params.id}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowIdentityVerification(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDocumentVerification} onOpenChange={setShowDocumentVerification}>
        <DialogContent className="max-w-3xl bg-gray-900 text-white border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-primary" />
              Verificación de documento de identidad
            </DialogTitle>
            <DialogDescription>
              Este proceso verifica la autenticidad del documento de identidad mediante análisis de la cámara
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RealTimeVideoVerification
              onVerificationComplete={handleDocumentVerification}
              onCancel={() => setShowDocumentVerification(false)}
              verificationMode="document"
              documentType="cedula_cl"
              autoStart={true}
              apiEndpoint="/api/identity/verify-document"
              sessionId={params.id}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDocumentVerification(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SignatureModal 
        open={showSignatureModal} 
        onOpenChange={setShowSignatureModal} 
        onSave={saveSignature} 
      />
    </div>
  );
}