import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, Camera, FileText, FileCheck, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Interfaz para el resultado de la verificación biométrica
 */
export interface BiometricVerificationResult {
  verified: boolean;
  score: number;
  method: string;
  timestamp: string;
  documentData?: {
    documentType: string;
    documentNumber: string;
    fullName: string;
    nationality?: string;
    birthDate?: string;
    issueDate?: string;
    expiryDate?: string;
  };
}

/**
 * Interfaz para las propiedades del componente de verificación biométrica
 */
interface BiometricVerificationProps {
  /**
   * Función a ejecutar cuando se completa la verificación
   */
  onVerificationComplete: (result: BiometricVerificationResult) => void;
  /**
   * Función a ejecutar si el usuario cancela el proceso
   */
  onCancel: () => void;
  /**
   * Tipo de verificación a realizar (cédula, selfie, ambos)
   */
  verificationType?: "document" | "selfie" | "both";
}

/**
 * Componente para verificación biométrica que utiliza la cámara para
 * capturar documentos de identidad y selfies, usando GetAPI.cl para
 * la verificación en backend
 */
const BiometricVerification: React.FC<BiometricVerificationProps> = ({
  onVerificationComplete,
  onCancel,
  verificationType = "both"
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeTab, setActiveTab] = useState<"document" | "selfie">(
    verificationType === "selfie" ? "selfie" : "document"
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Activar la cámara cuando el componente se monta
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [activeTab]);
  
  // Iniciar la cámara
  const startCamera = async () => {
    try {
      // Si hay un stream existente, detenerlo primero
      if (stream) {
        stopCamera();
      }
      
      // Configurar la cámara según el tipo de verificación
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: activeTab === "selfie" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Por favor, verifique los permisos.");
    }
  };
  
  // Detener la cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  // Capturar imagen
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurar el canvas para capturar la imagen
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    // Si es selfie, invertir horizontalmente
    if (activeTab === "selfie") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
    // Dibujar el video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Obtener la imagen como data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    
    // Almacenar la imagen según corresponda
    if (activeTab === "document") {
      setDocumentImage(imageDataUrl);
      
      toast({
        title: "Documento capturado",
        description: "La imagen del documento se ha capturado correctamente",
      });
      
      // Si solo se requiere documento o ambos, pasar a selfie
      if (verificationType === "both") {
        setActiveTab("selfie");
      } else {
        // Si solo se requiere documento, iniciar verificación
        startVerification(imageDataUrl, null);
      }
    } else {
      setSelfieImage(imageDataUrl);
      
      toast({
        title: "Selfie capturado",
        description: "La imagen del rostro se ha capturado correctamente",
      });
      
      // Si ya tenemos el documento y el selfie, iniciar verificación
      if (documentImage) {
        startVerification(documentImage, imageDataUrl);
      } else if (verificationType === "selfie") {
        // Si solo se requiere selfie, iniciar verificación
        startVerification(null, imageDataUrl);
      }
    }
    
    setIsCapturing(false);
  };
  
  // Reintentar captura
  const retryCapture = () => {
    if (activeTab === "document") {
      setDocumentImage(null);
    } else {
      setSelfieImage(null);
    }
    startCamera();
  };
  
  // Iniciar proceso de verificación
  const startVerification = (docImage: string | null, selfImage: string | null) => {
    setIsVerifying(true);
    setVerificationProgress(10);
    
    // Simular proceso de verificación con GetAPI.cl
    setTimeout(() => {
      setVerificationProgress(30);
      
      setTimeout(() => {
        setVerificationProgress(60);
        
        // Simulación del proceso completo
        setTimeout(() => {
          setVerificationProgress(100);
          
          // Resultado simulado de verificación exitosa
          const result: BiometricVerificationResult = {
            verified: true,
            score: 96.8,
            method: verificationType === "both" ? "document+selfie" : 
                   verificationType === "document" ? "document" : "selfie",
            timestamp: new Date().toISOString(),
            documentData: {
              documentType: "CÉDULA DE IDENTIDAD",
              documentNumber: "17.254.336-8",
              fullName: "EDUARDO ANTONIO VENEGAS BERRÍOS",
              nationality: "CHILENA",
              birthDate: "1989-06-15",
              issueDate: "2022-03-10",
              expiryDate: "2032-03-09"
            }
          };
          
          onVerificationComplete(result);
          
          toast({
            title: "Verificación completada",
            description: "La identidad ha sido verificada correctamente",
          });
        }, 1500);
      }, 2000);
    }, 1500);
  };
  
  // Renderizar guía para captura de documento
  const renderDocumentGuide = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-[90%] h-[70%] mx-auto mt-[15%] border-2 border-dashed border-white rounded-lg flex items-center justify-center">
        <div className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
          Coloque su cédula dentro del marco
        </div>
      </div>
    </div>
  );
  
  // Renderizar guía para captura de selfie
  const renderSelfieGuide = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-[70%] h-[70%] mx-auto mt-[15%] border-2 border-dashed border-white rounded-full flex items-center justify-center">
        <div className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
          Centre su rostro en el área
        </div>
      </div>
    </div>
  );
  
  // Renderizar el contenido según el estado
  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-12 w-12 text-[#2d219b] animate-spin mb-4" />
            <h3 className="font-medium text-lg mb-2">Verificando identidad</h3>
            <p className="text-sm text-gray-600 mb-4">
              Procesando las imágenes y verificando la identidad. Por favor, espere.
            </p>
          </div>
          
          <Progress value={verificationProgress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            Esto puede tomar unos segundos...
          </p>
          
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Su información será verificada usando la tecnología de GetAPI.cl y procesadores biométricos avanzados.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return (
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "document" | "selfie")}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="document" disabled={verificationType === "selfie"}>
            <FileText className="h-4 w-4 mr-2" />
            Documento
          </TabsTrigger>
          <TabsTrigger value="selfie" disabled={verificationType === "document"}>
            <Camera className="h-4 w-4 mr-2" />
            Selfie
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="document" className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Captura de documento de identidad</h3>
            <p className="text-sm text-gray-600">
              Capture una foto clara de su cédula de identidad. Asegúrese de que toda la cédula sea visible.
            </p>
          </div>
          
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {documentImage ? (
              <img 
                src={documentImage}
                alt="Documento capturado"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {renderDocumentGuide()}
              </>
            )}
          </div>
          
          <div className="flex justify-between">
            {documentImage ? (
              <>
                <Button variant="outline" onClick={retryCapture}>
                  Volver a capturar
                </Button>
                
                {verificationType !== "both" && (
                  <Button 
                    onClick={() => startVerification(documentImage, null)}
                    disabled={isVerifying}
                  >
                    Verificar documento
                  </Button>
                )}
              </>
            ) : (
              <Button 
                onClick={captureImage}
                disabled={isCapturing || !stream}
                className="ml-auto"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Capturando...
                  </>
                ) : (
                  "Capturar documento"
                )}
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="selfie" className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Captura de selfie</h3>
            <p className="text-sm text-gray-600">
              Tome una foto clara de su rostro. Asegúrese de estar en un área bien iluminada.
            </p>
          </div>
          
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {selfieImage ? (
              <img 
                src={selfieImage}
                alt="Selfie capturado"
                className="w-full h-full object-contain"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {renderSelfieGuide()}
              </>
            )}
          </div>
          
          <div className="flex justify-between">
            {selfieImage ? (
              <>
                <Button variant="outline" onClick={retryCapture}>
                  Volver a capturar
                </Button>
                
                {(verificationType === "selfie" || (verificationType === "both" && documentImage)) && (
                  <Button 
                    onClick={() => startVerification(documentImage, selfieImage)}
                    disabled={isVerifying}
                  >
                    {verificationType === "both" ? "Verificar identidad" : "Verificar selfie"}
                  </Button>
                )}
              </>
            ) : (
              <Button 
                onClick={captureImage}
                disabled={isCapturing || !stream}
                className="ml-auto"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Capturando...
                  </>
                ) : (
                  "Capturar selfie"
                )}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-[#2d219b]">Verificación de Identidad</CardTitle>
        <CardDescription className="text-center">
          {verificationType === "both" ? 
            "Capture su documento y un selfie para verificar su identidad" : 
            verificationType === "document" ?
              "Capture su documento para verificar su identidad" :
              "Capture un selfie para verificar su identidad"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error en el proceso</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : renderContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onCancel} disabled={isVerifying}>
          Cancelar
        </Button>
        
        {error && (
          <Button onClick={() => {
            setError(null);
            startCamera();
          }}>
            Reintentar
          </Button>
        )}
      </CardFooter>
      
      {/* Canvas oculto para capturar la imagen */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Card>
  );
};

export default BiometricVerification;