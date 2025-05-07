import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Camera, X, Image as ImageIcon, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
  aspectRatio?: string;
  maxWidth?: number;
  captureLabel?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  aspectRatio = "4/3",
  maxWidth = 640,
  captureLabel = "Capturar"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  
  // Activar la cámara
  const activateCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: maxWidth },
          aspectRatio: parseFloat(aspectRatio.replace("/", "/"))
        },
        audio: false
      };
      
      if (stream) {
        stopCamera();
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setHasPermission(true);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
      
      toast({
        title: "Cámara activada",
        description: "La cámara se ha iniciado correctamente",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
      setIsCameraActive(false);
      
      toast({
        title: "Error al acceder a la cámara",
        description: "Por favor, asegúrese de que la aplicación tiene permiso para usar la cámara",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  // Detener la cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };
  
  // Cambiar entre cámara frontal y trasera
  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    // El cambio efectivo ocurrirá en el efecto que observa isFrontCamera
  };
  
  // Capturar imagen
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Si es cámara frontal, podríamos voltear horizontalmente
        if (isFrontCamera) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageSrc = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageSrc);
        
        toast({
          title: "Imagen capturada",
          description: "La imagen se ha capturado correctamente",
          duration: 3000,
        });
      }
    }
  };
  
  // Aceptar la imagen capturada
  const acceptImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  };
  
  // Reintentar captura
  const retryCapture = () => {
    setCapturedImage(null);
  };
  
  // Efecto para iniciar/detener la cámara al montar/desmontar el componente
  useEffect(() => {
    activateCamera();
    
    return () => {
      stopCamera();
    };
  }, [isFrontCamera]);
  
  // Calcular el estilo para mantener la relación de aspecto
  const aspectStyle = {
    aspectRatio,
    maxWidth: `${maxWidth}px`,
    margin: "0 auto"
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        {!capturedImage ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Captura de foto</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                title="Cerrar cámara"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div 
              className="bg-gray-100 rounded-md overflow-hidden relative"
              style={aspectStyle}
            >
              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: isFrontCamera ? "scaleX(-1)" : "none" }}
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none opacity-60"></div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full min-h-[240px]">
                  {hasPermission === false ? (
                    <div className="text-center px-4 py-8">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-4">No se pudo acceder a la cámara</p>
                      <Button onClick={activateCamera}>
                        Reintentar
                      </Button>
                    </div>
                  ) : (
                    <div className="animate-pulse flex flex-col items-center">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Iniciando cámara...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline" 
                onClick={switchCamera}
                disabled={!isCameraActive}
                title="Cambiar cámara"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Cambiar cámara
              </Button>
              
              <Button 
                onClick={captureImage}
                disabled={!isCameraActive}
                title={captureLabel}
              >
                <Camera className="h-4 w-4 mr-2" />
                {captureLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Previsualización</h2>
              <Button
                variant="ghost" 
                size="icon"
                onClick={onCancel}
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div 
              className="bg-gray-100 rounded-md overflow-hidden"
              style={aspectStyle}
            >
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={retryCapture}
                title="Reintentar captura"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              
              <Button 
                onClick={acceptImage}
                title="Aceptar imagen"
              >
                <Check className="h-4 w-4 mr-2" />
                Aceptar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
        <div className="w-full text-center">
          {isFrontCamera ? "Usando cámara frontal" : "Usando cámara trasera"} • 
          La imagen se utilizará para el documento seleccionado
        </div>
      </CardFooter>
      
      {/* Canvas oculto para capturar la imagen */}
      <canvas 
        ref={canvasRef} 
        style={{ display: "none" }}
      />
    </Card>
  );
};

export default CameraCapture;