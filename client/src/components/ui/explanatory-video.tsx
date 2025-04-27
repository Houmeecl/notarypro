import React, { useState } from "react";
import { Play, Pause, X, Video, Info, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import videoThumbnails, { videoScripts } from "@/lib/video-thumbnails";

interface ExplanatoryVideoProps {
  title: string;
  description: string;
  videoUrl?: string;
  videoType?: "explanation" | "tutorial" | "verification";
  triggerLabel?: string;
  children?: React.ReactNode;
}

/**
 * Componente para mostrar videos explicativos en distintas partes de la aplicación
 */
// Videos explicativos profesionales para nuestra plataforma
const defaultVideos = {
  explanation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Explicación general de la plataforma
  tutorial: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", // Tutorial paso a paso de firma de documentos
  verification: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" // Proceso de verificación de identidad
};

// Títulos y descripciones predeterminados para cada tipo de video
const videoTitles = {
  explanation: "Cómo funciona NotaryPro",
  tutorial: "Tutorial: Firma de documentos",
  verification: "Proceso de verificación de identidad"
};

const videoDescriptions = {
  explanation: "Descubre cómo NotaryPro te permite firmar y certificar documentos con validez legal bajo la Ley 19.799. Conoce nuestra plataforma, beneficios y red de Vecinos Express para una gestión documental simple, segura y legal en todo Chile.",
  tutorial: "Aprende paso a paso cómo subir, preparar y firmar documentos digitales en nuestra plataforma. Este tutorial te muestra el proceso completo desde la carga del documento hasta la firma con validez legal y cómo compartirlo con otras personas.",
  verification: "La verificación de identidad es fundamental para la validez legal de tus documentos. Conoce nuestros tres métodos de verificación: por videollamada con certificador profesional, mediante Clave Única del Estado o con verificación biométrica automatizada."
};

// Mensajes que se muestran al finalizar el video
const videoCompletionMessages = {
  explanation: "Ya conoces NotaryPro. ¡Prueba nuestra plataforma para experimentar todas sus ventajas!",
  tutorial: "¡Felicidades! Ahora sabes cómo firmar documentos en NotaryPro. ¿Listo para comenzar?",
  verification: "Ahora entiendes nuestro proceso de verificación seguro. Tu identidad está protegida con NotaryPro."
};

export const ExplanatoryVideo: React.FC<ExplanatoryVideoProps> = ({
  title,
  description,
  videoUrl,
  videoType = "explanation",
  triggerLabel = "Ver video explicativo",
  children
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoSrc = videoUrl || defaultVideos[videoType];
  const videoTitle = title || videoTitles[videoType];
  const videoDescription = description || videoDescriptions[videoType];

  const handlePlayPause = () => {
    const video = document.getElementById("explanatory-video") as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {videoTitle}
          </DialogTitle>
          <DialogDescription>
            {videoDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="relative rounded-md overflow-hidden">
          <div className="relative w-full overflow-hidden rounded-md border border-muted">
            <div className="aspect-video bg-muted/20">
              <video
                id="explanatory-video"
                className="w-full h-full object-cover transition-all duration-300"
                src={videoSrc}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
                preload="metadata"
                poster={videoThumbnails[videoType]}
              />
            </div>
            
            {/* Overlay de reproducción con animación */}
            <div 
              className={`absolute inset-0 bg-black/5 flex items-center justify-center transition-opacity duration-300 ${
                isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <div 
                className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center cursor-pointer hover:bg-primary transition-transform duration-200 hover:scale-110"
                onClick={handlePlayPause}
              >
                <Play className="h-8 w-8 ml-1" />
              </div>
            </div>
            
            {/* Controles */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent ${
              isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 transition-all"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" /> Reproducir
                  </>
                )}
              </Button>
              
              <div className="text-xs text-white/80">
                Video explicativo
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full text-sm gap-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Duración estimada: {videoType === "tutorial" ? "2:30" : (videoType === "verification" ? "2:15" : "2:00")} min
            </div>
            
            <a 
              href={videoScripts[videoType]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar guión
              </Button>
            </a>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};