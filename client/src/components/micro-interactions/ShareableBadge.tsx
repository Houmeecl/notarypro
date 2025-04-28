import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Check, Copy, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import logo from '@assets/logo12582620.png';

// Importamos el componente mejorado de SocialShareButtonHelper
import SocialShareButtonHelper from './SocialShareButtonHelper';

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
                  Puedes compartirlo directamente en redes sociales o copiar el enlace.
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
              
              {/* Social Media Sharing Buttons */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Compartir en redes sociales</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {/* Twitter/X */}
                  <SocialShareButtonHelper 
                    network="twitter" 
                    shareUrl={`${window.location.origin}/share-achievement/${achievement.id}`}
                    title={`¡He desbloqueado el logro "${achievement.name}" en Cerfidoc!`}
                    hashtags={["VerificaciónDigital", "Cerfidoc", "Chile"]}
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    }
                    size="icon"
                  />
                  
                  {/* Facebook */}
                  <SocialShareButtonHelper 
                    network="facebook" 
                    shareUrl={`${window.location.origin}/share-achievement/${achievement.id}`}
                    quote={`¡He desbloqueado el logro "${achievement.name}" en Cerfidoc! Plataforma líder de verificación de documentos digitales en Chile.`}
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                      </svg>
                    }
                    size="icon"
                  />
                  
                  {/* LinkedIn */}
                  <SocialShareButtonHelper 
                    network="linkedin" 
                    shareUrl={`${window.location.origin}/share-achievement/${achievement.id}`}
                    title={`Logro "${achievement.name}" en Cerfidoc`}
                    summary={achievement.description || "Plataforma de verificación de documentos digitales en Chile"}
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    }
                    size="icon"
                  />
                  
                  {/* WhatsApp */}
                  <SocialShareButtonHelper 
                    network="whatsapp" 
                    shareUrl={`${window.location.origin}/share-achievement/${achievement.id}`}
                    title={`¡He desbloqueado el logro "${achievement.name}" en Cerfidoc! 🏆`}
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M11.999 21.75h-.03a9.702 9.702 0 0 1-4.935-1.34l-.354-.21-3.67.964.981-3.583-.23-.37a9.68 9.68 0 0 1-1.482-5.182c.001-5.354 4.359-9.71 9.715-9.71 2.595.001 5.031 1.01 6.865 2.845a9.627 9.627 0 0 1 2.844 6.867c-.002 5.354-4.359 9.71-9.714 9.71zm0-18.66A8.242 8.242 0 0 0 3.76 11.326a8.096 8.096 0 0 0 1.282 4.36L3.69 20.75l5.21-1.366a8.254 8.254 0 0 0 3.07.586h.03a8.242 8.242 0 0 0 8.24-8.245a8.16 8.16 0 0 0-2.44-5.83 8.174 8.174 0 0 0-5.8-2.406z" />
                      </svg>
                    }
                    size="icon"
                  />
                  
                  {/* Instagram */}
                  <SocialShareButtonHelper 
                    network="instagram" 
                    shareUrl={`${window.location.origin}/share-achievement/${achievement.id}`}
                    title={`¡Logro desbloqueado en Cerfidoc!`}
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    }
                    size="icon"
                  />
                  
                  {/* Pinterest */}
                  <SocialShareButtonHelper 
                    network="pinterest" 
                    shareUrl={`${window.location.origin}/share-achievement/${achievement.id}`}
                    title={`Logro "${achievement.name}" en Cerfidoc - Verificación de documentos digitales`}
                    icon={
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                      </svg>
                    }
                    size="icon"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4">
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
              
              <DialogFooter className="sm:justify-start mt-2">
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