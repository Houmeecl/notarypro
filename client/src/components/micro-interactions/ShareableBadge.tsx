import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Check, Copy, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import logo from '@assets/logo12582620.png';

interface ShareableBadgeProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    level: number;
    badgeImageUrl?: string;
    unlockedAt?: string;
    rewardPoints?: number;
  };
  className?: string;
}

export const ShareableBadge: React.FC<ShareableBadgeProps> = ({ 
  achievement, 
  className = ''
}) => {
  const { toast } = useToast();
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Función para descargar la insignia como imagen
  const downloadBadge = async () => {
    if (!badgeRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: null,
        scale: 2, // Mayor calidad
        logging: false
      });
      
      // Convertir a imagen
      const image = canvas.toDataURL('image/png');
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = image;
      link.download = `cerfidoc-logro-${achievement.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      
      toast({
        title: '¡Imagen descargada!',
        description: 'Tu insignia ha sido descargada correctamente',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      toast({
        title: 'Error al descargar',
        description: 'No se pudo generar la imagen. Inténtalo de nuevo.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Función para compartir en redes sociales
  const shareBadge = () => {
    setIsSharing(true);
  };
  
  // Función para copiar enlace
  const copyLink = () => {
    const shareUrl = `${window.location.origin}/share-achievement/${achievement.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Enlace copiado',
      description: 'El enlace para compartir ha sido copiado al portapapeles',
      duration: 3000,
    });
  };

  return (
    <>
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg font-bold">
            {achievement.name}
          </CardTitle>
          <CardDescription className="text-center">
            Nivel {achievement.level}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex justify-center pb-2" ref={badgeRef}>
          <div className="bg-primary-50 dark:bg-primary-950/50 p-6 rounded-lg text-center">
            <div className="flex flex-col items-center">
              {achievement.badgeImageUrl ? (
                <img 
                  src={achievement.badgeImageUrl} 
                  alt={achievement.name} 
                  className="w-24 h-24 object-contain mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Award className="w-12 h-12 text-primary" />
                </div>
              )}
              
              <p className="text-sm font-medium mb-1">{achievement.name}</p>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
              
              {achievement.rewardPoints && (
                <p className="text-xs font-semibold text-primary mt-2">
                  +{achievement.rewardPoints} puntos
                </p>
              )}
              
              <img src={logo} alt="Cerfidoc" className="h-5 mt-4 opacity-60" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="justify-center gap-2 pt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadBadge}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSharing(true)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartir logro</DialogTitle>
                <DialogDescription>
                  Comparte este logro con tus amigos y colegas
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <p className="text-sm">
                  Tu logro "{achievement.name}" ahora está disponible para compartir. 
                  Puedes copiar el enlace y compartirlo en redes sociales o por mensaje directo.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <div className="bg-primary-50 dark:bg-primary-950/50 p-2 rounded-md w-32 h-32 flex items-center justify-center">
                    {achievement.badgeImageUrl ? (
                      <img 
                        src={achievement.badgeImageUrl} 
                        alt={achievement.name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    ) : (
                      <Award className="w-16 h-16 text-primary/60" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    
                    {achievement.rewardPoints && (
                      <p className="text-xs font-medium text-primary">
                        +{achievement.rewardPoints} puntos
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={downloadBadge}
                        disabled={isDownloading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Descargar imagen</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  variant="secondary"
                  className={`gap-2 ${copied ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                  onClick={copyLink}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "¡Copiado!" : "Copiar enlace"}
                </Button>
              </div>
              
              <DialogFooter className="sm:justify-start">
                <DialogDescription>
                  Un enlace público a tu logro será generado. No se compartirá ninguna información personal.
                </DialogDescription>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  );
};