import React, { useRef, useState } from 'react';
import { 
  Share2, Facebook, Twitter, Linkedin, Copy, Check, Download, X, Image as ImageIcon, CheckCircle, Trophy, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import logo from '@assets/logo12582620.png';

// Tipos
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

// Componente de insignia para compartir
export const ShareableBadge: React.FC<ShareableBadgeProps> = ({ 
  achievement,
  className = '' 
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/share-achievement/${achievement.id}`;

  // Función para compartir en redes sociales
  const shareOnSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    const text = `¡He desbloqueado el logro "${achievement.name}" en Cerfidoc! Verificación de documentos digital para Chile.`;
    const hashtags = 'Cerfidoc,VerificaciónDigital,Certificación';
    
    let url;
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Logro desbloqueado en Cerfidoc')}&summary=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Función para copiar enlace
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Enlace copiado',
      description: 'El enlace ha sido copiado al portapapeles'
    });
  };

  // Función para descargar como imagen
  const downloadAsImage = async () => {
    if (!badgeRef.current) return;
    
    try {
      // Importamos html2canvas dinámicamente
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      // Convertir a PNG y descargar
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `cerfidoc-logro-${achievement.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      
      toast({
        title: 'Insignia descargada',
        description: 'La imagen ha sido descargada correctamente'
      });
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      toast({
        variant: 'destructive',
        title: 'Error al descargar',
        description: 'No se pudo generar la imagen de la insignia'
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={`gap-2 ${className}`}
        onClick={() => setOpen(true)}
      >
        <Share2 className="h-4 w-4" />
        Compartir logro
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir logro</DialogTitle>
            <DialogDescription>
              Comparte tu logro "{achievement.name}" en tus redes sociales
            </DialogDescription>
          </DialogHeader>
          
          {/* Vista previa de la insignia */}
          <div className="rounded-md border p-1 bg-background">
            <div ref={badgeRef} className="p-6 relative">
              {/* Contenido de la insignia */}
              <div className="relative">
                <div className="absolute top-0 right-0 z-10">
                  <img 
                    src={logo} 
                    alt="Cerfidoc Logo" 
                    className="h-8 w-auto"
                  />
                </div>
                
                <Card className="border shadow-md overflow-hidden">
                  <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-primary to-primary/50"></div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">
                        {achievement.name}
                      </CardTitle>
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <CardDescription>
                      Nivel {achievement.level} - Certificación de documentos
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex gap-4 items-center mb-3">
                      <div className="flex-shrink-0">
                        {achievement.badgeImageUrl ? (
                          <img 
                            src={achievement.badgeImageUrl} 
                            alt={achievement.name}
                            className="h-16 w-16 object-contain" 
                          />
                        ) : (
                          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{achievement.description}</p>
                        
                        {achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Desbloqueado hace {formatDistanceToNow(new Date(achievement.unlockedAt), { locale: es })}
                          </p>
                        )}
                        
                        {achievement.rewardPoints && (
                          <Badge variant="secondary" className="mt-2">
                            +{achievement.rewardPoints} puntos
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-center text-muted-foreground mt-3 pt-3 border-t">
                      #CerfidocVerificación #CertificaciónDigital
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 grid-cols-4 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareOnSocial('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Twitter</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareOnSocial('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Facebook</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => shareOnSocial('linkedin')}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">LinkedIn</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={downloadAsImage}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Descargar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
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
    </>
  );
};