import { useState, useEffect } from 'react';
import { 
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ExplanatoryVideoProps {
  src: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function ExplanatoryVideo({
  src,
  title,
  poster,
  autoPlay = false,
  onComplete,
  className,
}: ExplanatoryVideoProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  console.log("Rendering ExplanatoryVideo component with src:", src);

  useEffect(() => {
    // Control visibility of controls
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Control play/pause
  useEffect(() => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
        setIsPlaying(false);
      });
    } else {
      videoElement.pause();
    }
  }, [isPlaying, videoElement]);

  // Control volume
  useEffect(() => {
    if (!videoElement) return;
    
    videoElement.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, videoElement]);

  // Handle video events
  const handleVideoRef = (el: HTMLVideoElement | null) => {
    setVideoElement(el);
  };

  const handleTimeUpdate = () => {
    if (!videoElement) return;
    
    setCurrentTime(videoElement.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoElement) return;
    
    setDuration(videoElement.duration);
    setIsLoaded(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Control functions
  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  
  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
    if (newValue[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleSeek = (newValue: number[]) => {
    if (!videoElement) return;
    
    const newTime = (newValue[0] / 100) * duration;
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const skip = (seconds: number) => {
    if (!videoElement) return;
    
    const newTime = Math.min(Math.max(0, videoElement.currentTime + seconds), duration);
    videoElement.currentTime = newTime;
  };
  
  const toggleFullscreen = () => {
    if (!videoElement) return;
    
    if (!isFullscreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Progress as percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden group bg-black", 
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={handleVideoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        playsInline
      />
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Title */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
          <h3 className="font-medium">{title}</h3>
        </div>
      )}
      
      {/* Video controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Progress bar */}
        <Slider
          value={[progress]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="mb-4"
        />
        
        <div className="flex items-center justify-between gap-2">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          
          {/* Time display */}
          <div className="text-white/90 text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Large play button overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="rounded-full bg-primary/80 p-5">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}