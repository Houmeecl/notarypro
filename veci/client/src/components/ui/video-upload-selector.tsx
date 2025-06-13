import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import { Upload, Video, Info, FileVideo, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoOption {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  type: "explanation" | "tutorial" | "legal" | "demo";
}

const PREDEFINED_VIDEOS: VideoOption[] = [
  {
    id: "ley-19799",
    title: "Ley 19.799 - Validez Legal de Certificaciones Digitales",
    description: "Explicación detallada sobre cómo la Ley 19.799 respalda la validez legal de las firmas electrónicas y certificaciones remotas en Chile.",
    thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    type: "legal"
  },
  {
    id: "tutorial-certificacion",
    title: "Tutorial: Proceso de Certificación Remota",
    description: "Guía paso a paso sobre cómo realizar una certificación remota por video, desde la verificación de identidad hasta la firma del documento.",
    thumbnail: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    type: "tutorial"
  },
  {
    id: "validez-internacional",
    title: "Validez Internacional de Documentos Certificados",
    description: "Aprende sobre la validez internacional de los documentos certificados a través de nuestra plataforma y cómo utilizarlos en el extranjero.",
    thumbnail: "https://images.unsplash.com/photo-1529119513321-989c92d50ce0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    type: "explanation"
  }
];

interface VideoUploadSelectorProps {
  onVideoSelected?: (videoFile: File | null, selectedVideoId: string | null) => void;
  onThumbnailSelected?: (thumbnailFile: File | null) => void;
  defaultVideoId?: string;
  showUploadOption?: boolean;
  label?: string;
}

export function VideoUploadSelector({
  onVideoSelected,
  onThumbnailSelected,
  defaultVideoId,
  showUploadOption = true,
  label = "Seleccionar video explicativo"
}: VideoUploadSelectorProps) {
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(defaultVideoId || null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<boolean>(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setUploadedVideo(file);
        setSelectedPredefined(null);
        if (onVideoSelected) onVideoSelected(file, null);
        toast({
          title: "Video cargado correctamente",
          description: `Archivo: ${file.name}`,
        });
      } else {
        toast({
          title: "Formato no válido",
          description: "Por favor, sube un archivo de video (mp4, webm, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploadedThumbnail(file);
        if (onThumbnailSelected) onThumbnailSelected(file);
        toast({
          title: "Miniatura cargada correctamente",
          description: `Archivo: ${file.name}`,
        });
      } else {
        toast({
          title: "Formato no válido",
          description: "Por favor, sube una imagen (jpg, png, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handlePredefinedSelect = (videoId: string) => {
    setSelectedPredefined(videoId);
    setUploadedVideo(null);
    setUploadMode(false);
    if (onVideoSelected) onVideoSelected(null, videoId);
  };

  const toggleUploadMode = () => {
    setUploadMode(!uploadMode);
    if (!uploadMode) {
      setSelectedPredefined(null);
      if (onVideoSelected) onVideoSelected(null, null);
    }
  };

  const selectedVideo = PREDEFINED_VIDEOS.find(v => v.id === selectedPredefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{label}</h3>
        {showUploadOption && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleUploadMode}
            className="flex items-center gap-2"
          >
            {uploadMode ? (
              <>
                <Video className="h-4 w-4" />
                <span>Seleccionar predefinido</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Subir video propio</span>
              </>
            )}
          </Button>
        )}
      </div>

      {uploadMode ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => videoInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={videoInputRef}
                  accept="video/*" 
                  onChange={handleVideoUpload}
                />
                
                {uploadedVideo ? (
                  <div className="space-y-2">
                    <div className="bg-primary/10 p-3 rounded-full mx-auto">
                      <FileVideo className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium text-primary">{uploadedVideo.name}</p>
                    <p className="text-sm text-gray-500">
                      {Math.round(uploadedVideo.size / 1024 / 1024 * 10) / 10} MB
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Cambiar video
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-gray-100 p-3 rounded-full mx-auto">
                      <Video className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium">Sube tu video explicativo</p>
                    <p className="text-sm text-gray-500">
                      Arrastra y suelta o haz clic para seleccionar un archivo de video
                    </p>
                    <p className="text-xs text-gray-400">
                      Formatos soportados: MP4, WebM, MOV (máx. 100 MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {uploadedVideo && (
            <Card>
              <CardContent className="p-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={thumbnailInputRef}
                    accept="image/*" 
                    onChange={handleThumbnailUpload}
                  />
                  
                  {uploadedThumbnail ? (
                    <div className="space-y-2 w-full">
                      <div className="aspect-video w-full rounded-lg overflow-hidden mb-2">
                        <img 
                          src={URL.createObjectURL(uploadedThumbnail)} 
                          alt="Miniatura seleccionada" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium text-primary">{uploadedThumbnail.name}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Cambiar miniatura
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-3 rounded-full mx-auto">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="font-medium">Sube una miniatura para el video</p>
                      <p className="text-sm text-gray-500">
                        Selecciona una imagen representativa para tu video explicativo
                      </p>
                      <p className="text-xs text-gray-400">
                        Recomendado: 16:9, formato JPG o PNG
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Select value={selectedPredefined || ""} onValueChange={handlePredefinedSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un video explicativo" />
            </SelectTrigger>
            <SelectContent>
              {PREDEFINED_VIDEOS.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  <div className="flex items-center gap-2">
                    <span>{video.title}</span>
                    {video.type === "legal" && (
                      <Info className="h-3 w-3 text-primary" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedVideo && (
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={selectedVideo.thumbnail} 
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover"
                />
                <ExplanatoryVideo
                  title={selectedVideo.title}
                  description={selectedVideo.description}
                  videoType={selectedVideo.type}
                  triggerLabel="Ver video"
                >
                  <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer">
                    <div className="bg-primary/90 text-white rounded-full p-3">
                      <Play className="h-8 w-8" />
                    </div>
                  </div>
                </ExplanatoryVideo>
                <div className="absolute bottom-3 left-3 bg-primary/90 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  {selectedVideo.type === "legal" && (
                    <>
                      <Info className="h-3 w-3" />
                      <span>Validez Legal</span>
                    </>
                  )}
                  {selectedVideo.type === "tutorial" && (
                    <>
                      <Video className="h-3 w-3" />
                      <span>Tutorial</span>
                    </>
                  )}
                  {selectedVideo.type === "explanation" && (
                    <>
                      <Info className="h-3 w-3" />
                      <span>Informativo</span>
                    </>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-600">{selectedVideo.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}