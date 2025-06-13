import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Document } from "@shared/schema";

interface IdentityVerificationProps {
  documentId: number;
  onVerificationComplete: () => void;
}

export default function IdentityVerification({ documentId, onVerificationComplete }: IdentityVerificationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("camera");
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isCapturingId, setIsCapturingId] = useState(false);
  const [isCapturingSelfie, setIsCapturingSelfie] = useState(false);
  
  const idVideoRef = useRef<HTMLVideoElement>(null);
  const selfieVideoRef = useRef<HTMLVideoElement>(null);
  const idCanvasRef = useRef<HTMLCanvasElement>(null);
  const selfieCanvasRef = useRef<HTMLCanvasElement>(null);

  const verificationMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/identity-verification", formData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/identity-verification/${documentId}`] });
      toast({
        title: "Verificación enviada con éxito",
        description: "Tu identidad será validada por un certificador.",
      });
      onVerificationComplete();
    },
    onError: (error) => {
      toast({
        title: "Error en la verificación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Camera initialization functions
  const startIdCamera = async () => {
    try {
      setIsCapturingId(true);
      if (idVideoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        idVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        variant: "destructive",
      });
      setIsCapturingId(false);
    }
  };

  const startSelfieCamera = async () => {
    try {
      setIsCapturingSelfie(true);
      if (selfieVideoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        selfieVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        variant: "destructive",
      });
      setIsCapturingSelfie(false);
    }
  };

  const stopCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture functions
  const captureIdPhoto = () => {
    if (idVideoRef.current && idCanvasRef.current) {
      const video = idVideoRef.current;
      const canvas = idCanvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "id-photo.jpg", { type: "image/jpeg" });
            setIdPhotoFile(file);
            setIdPhotoPreview(URL.createObjectURL(blob));
          }
        }, "image/jpeg", 0.9);
        
        stopCamera(idVideoRef);
        setIsCapturingId(false);
      }
    }
  };

  const captureSelfie = () => {
    if (selfieVideoRef.current && selfieCanvasRef.current) {
      const video = selfieVideoRef.current;
      const canvas = selfieCanvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            setSelfieFile(file);
            setSelfiePreview(URL.createObjectURL(blob));
          }
        }, "image/jpeg", 0.9);
        
        stopCamera(selfieVideoRef);
        setIsCapturingSelfie(false);
      }
    }
  };

  // File upload functions
  const handleIdPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setIdPhotoFile(file);
        setIdPhotoPreview(URL.createObjectURL(file));
      } else {
        toast({
          title: "Formato no soportado",
          description: "Por favor, sube una imagen en formato JPG, PNG o JPEG.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setSelfieFile(file);
        setSelfiePreview(URL.createObjectURL(file));
      } else {
        toast({
          title: "Formato no soportado",
          description: "Por favor, sube una imagen en formato JPG, PNG o JPEG.",
          variant: "destructive",
        });
      }
    }
  };

  const resetIdPhoto = () => {
    setIdPhotoFile(null);
    setIdPhotoPreview(null);
    stopCamera(idVideoRef);
    setIsCapturingId(false);
  };

  const resetSelfie = () => {
    setSelfieFile(null);
    setSelfiePreview(null);
    stopCamera(selfieVideoRef);
    setIsCapturingSelfie(false);
  };

  const handleSubmit = () => {
    if (!idPhotoFile || !selfieFile) {
      toast({
        title: "Imágenes requeridas",
        description: "Por favor, proporciona tanto la foto del ID como la selfie.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("idPhoto", idPhotoFile);
    formData.append("selfie", selfieFile);
    formData.append("documentId", documentId.toString());
    
    verificationMutation.mutate(formData);
  };

  // Cleanup on tab change or unmount
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Stop any active cameras
    stopCamera(idVideoRef);
    stopCamera(selfieVideoRef);
    setIsCapturingId(false);
    setIsCapturingSelfie(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verificación de Identidad</CardTitle>
        <CardDescription>
          Para validar tu identidad, necesitamos una foto de tu documento de identidad y una selfie.
          Esto es requerido para la firma electrónica avanzada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="camera" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">
              <Camera className="h-4 w-4 mr-2" />
              Usar cámara
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Subir imágenes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="pt-4 space-y-6">
            {/* ID Photo Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documento de identidad</h3>
              <p className="text-sm text-gray-500">
                Toma una foto clara de tu documento de identidad (cédula, pasaporte, etc.)
              </p>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {!idPhotoPreview ? (
                  <>
                    {isCapturingId ? (
                      <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <video 
                            ref={idVideoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex justify-center space-x-2">
                          <Button onClick={captureIdPhoto} variant="default">
                            <Camera className="h-4 w-4 mr-2" />
                            Capturar foto
                          </Button>
                          <Button onClick={() => { stopCamera(idVideoRef); setIsCapturingId(false); }} variant="outline">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Button onClick={startIdCamera} variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Iniciar cámara
                        </Button>
                      </div>
                    )}
                    <canvas ref={idCanvasRef} className="hidden" />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <img 
                        src={idPhotoPreview} 
                        alt="ID" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={resetIdPhoto} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Volver a capturar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selfie Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Selfie</h3>
              <p className="text-sm text-gray-500">
                Toma una selfie clara de tu rostro para verificar tu identidad
              </p>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {!selfiePreview ? (
                  <>
                    {isCapturingSelfie ? (
                      <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <video 
                            ref={selfieVideoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex justify-center space-x-2">
                          <Button onClick={captureSelfie} variant="default">
                            <Camera className="h-4 w-4 mr-2" />
                            Capturar selfie
                          </Button>
                          <Button onClick={() => { stopCamera(selfieVideoRef); setIsCapturingSelfie(false); }} variant="outline">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Button onClick={startSelfieCamera} variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Iniciar cámara
                        </Button>
                      </div>
                    )}
                    <canvas ref={selfieCanvasRef} className="hidden" />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <img 
                        src={selfiePreview} 
                        alt="Selfie" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={resetSelfie} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Volver a capturar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="pt-4 space-y-6">
            {/* Upload ID Photo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documento de identidad</h3>
              <p className="text-sm text-gray-500">
                Sube una foto clara de tu documento de identidad (cédula, pasaporte, etc.)
              </p>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {!idPhotoPreview ? (
                  <div className="text-center p-6">
                    <label htmlFor="id-photo-upload" className="cursor-pointer">
                      <div className="space-y-4 flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <Button variant="outline">
                          Seleccionar archivo
                        </Button>
                        <p className="text-xs text-gray-500">JPG, PNG o JPEG, máx. 5MB</p>
                      </div>
                      <input
                        id="id-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleIdPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <img 
                        src={idPhotoPreview} 
                        alt="ID" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={resetIdPhoto} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Cambiar imagen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Upload Selfie */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Selfie</h3>
              <p className="text-sm text-gray-500">
                Sube una selfie clara de tu rostro para verificar tu identidad
              </p>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {!selfiePreview ? (
                  <div className="text-center p-6">
                    <label htmlFor="selfie-upload" className="cursor-pointer">
                      <div className="space-y-4 flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <Button variant="outline">
                          Seleccionar archivo
                        </Button>
                        <p className="text-xs text-gray-500">JPG, PNG o JPEG, máx. 5MB</p>
                      </div>
                      <input
                        id="selfie-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleSelfieUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <img 
                        src={selfiePreview} 
                        alt="Selfie" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={resetSelfie} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Cambiar imagen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status section */}
        {verificationMutation.isPending && (
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium">Cargando imágenes...</p>
            <Progress value={66} className="h-2" />
          </div>
        )}
        
        {verificationMutation.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Ocurrió un error al procesar tu verificación. Por favor, intenta de nuevo.
            </p>
          </div>
        )}
        
        {verificationMutation.isSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Verificación enviada con éxito. Un certificador validará tu identidad en breve.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!idPhotoFile || !selfieFile || verificationMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {verificationMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Enviar verificación
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
