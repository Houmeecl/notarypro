import React, { useState } from "react";
import { Play, Pause, X, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
export const ExplanatoryVideo: React.FC<ExplanatoryVideoProps> = ({
  title,
  description,
  videoUrl,
  videoType = "explanation",
  triggerLabel = "Ver video explicativo",
  children
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Videos animados predeterminados para distintos tipos de explicación
  const defaultVideos = {
    explanation: "https://assets.mixkit.co/videos/preview/mixkit-business-team-meeting-animated-video-4794-large.mp4",
    tutorial: "https://assets.mixkit.co/videos/preview/mixkit-animated-professional-business-infographics-4796-large.mp4",
    verification: "https://assets.mixkit.co/videos/preview/mixkit-animated-hands-demonstrating-mobile-app-3761-large.mp4"
  };

  const videoSrc = videoUrl || defaultVideos[videoType];

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
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
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
                poster="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 16 9'%3E%3C/svg%3E"
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
      </DialogContent>
    </Dialog>
  );
};