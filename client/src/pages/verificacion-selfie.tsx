import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

/**
 * Página de verificación de identidad mediante selfie
 * Esta página permite capturar una foto del rostro del usuario
 * para verificar su identidad
 */
export default function VerificacionSelfiePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Iniciar la cámara cuando el componente se monta
  useEffect(() => {
    startCamera();
    
    // Limpiar cuando el componente se desmonte
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Función para iniciar la cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setErrorMessage(
        "No se pudo acceder a la cámara. Por favor, asegúrate de dar permiso a la cámara y que no esté siendo utilizada por otra aplicación."
      );
      setCameraActive(false);
    }
  };

  // Función para capturar la foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Configurar el tamaño del canvas para coincidir con la resolución del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir el canvas a una URL de datos
    const dataUrl = canvas.toDataURL('image/png');
    setPhotoData(dataUrl);
    setPhotoTaken(true);
    
    // Detener la cámara después de tomar la foto
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Función para reiniciar la cámara y tomar otra foto
  const resetCamera = () => {
    setPhotoTaken(false);
    setPhotoData(null);
    startCamera();
  };

  // Función para enviar la foto para verificación
  const submitPhoto = async () => {
    if (!photoData) return;
    
    setLoading(true);
    
    try {
      // En una implementación real, aquí se enviaría la foto a la API
      // para verificar la identidad del usuario
      const response = await apiRequest("POST", "/api/identity/verify-selfie", {
        photo: photoData
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Tu identidad ha sido verificada correctamente",
        });
        
        // Simular un pequeño retraso antes de navegar a la siguiente pantalla
        setTimeout(() => {
          navigate("/document-selection");
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo verificar tu identidad. Por favor, intenta nuevamente.",
          variant: "destructive"
        });
        resetCamera();
      }
    } catch (error) {
      console.error("Error en la verificación:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar tu foto. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
      resetCamera();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-indigo-900 text-white rounded-t-lg">
          <CardTitle className="text-xl">Verificación de Identidad</CardTitle>
          <CardDescription className="text-gray-200">
            Por favor, captura una foto de tu rostro para verificar tu identidad
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4 w-full">
                {errorMessage}
              </div>
            )}
            
            {/* Área de video/previsualización */}
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
              {!photoTaken ? (
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={photoData || ''} 
                  alt="Foto capturada" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Canvas oculto para capturar la imagen */}
            <canvas 
              ref={canvasRef} 
              style={{ display: 'none' }}
            />
            
            {/* Instrucciones */}
            <p className="text-sm text-gray-600 text-center">
              {!photoTaken 
                ? "Posiciona tu rostro en el centro y asegúrate de tener buena iluminación" 
                : "¿Estás conforme con esta foto?"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
              }
              navigate("/");
            }}
          >
            Cancelar
          </Button>
          
          {!photoTaken ? (
            <Button 
              onClick={capturePhoto}
              disabled={!cameraActive || loading}
              className="bg-indigo-900 hover:bg-indigo-800"
            >
              Capturar Foto
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={resetCamera}
                disabled={loading}
              >
                Tomar Otra
              </Button>
              <Button 
                onClick={submitPhoto}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Verificando..." : "Verificar Identidad"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}