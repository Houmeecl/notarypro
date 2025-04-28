import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Award, CheckCircle, Copy, Home, Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareableBadge } from '@/components/micro-interactions/ShareableBadge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import logo from '@assets/logo12582620.png';

// Componente para botones de compartir en redes sociales
interface SocialShareButtonProps {
  network: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp';
  shareUrl: string;
  title?: string;
  summary?: string;
  quote?: string;
  icon: React.ReactNode;
  className?: string;
  iconOnly?: boolean;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({ 
  network, 
  shareUrl, 
  title, 
  summary, 
  quote,
  icon, 
  className,
  iconOnly = false
}) => {
  const getShareUrl = () => {
    switch (network) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title || '')}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote || '')}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title || '')}&summary=${encodeURIComponent(summary || '')}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${encodeURIComponent((title ? title + ' ' : '') + shareUrl)}`;
      default:
        return '#';
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Abrir en una ventana emergente para redes sociales
    const shareUrl = getShareUrl();
    
    if (network === 'whatsapp' && /Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)) {
      // En dispositivos móviles, abre WhatsApp en la misma ventana
      window.location.href = shareUrl;
      return;
    }
    
    const width = 550;
    const height = 450;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      shareUrl,
      `share-${network}`,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };
  
  const getNetworkName = () => {
    switch (network) {
      case 'twitter': return 'Twitter';
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'whatsapp': return 'WhatsApp';
      default: return network;
    }
  };
  
  const getButtonClasses = () => {
    let baseClasses = 'gap-2 ';
    
    switch (network) {
      case 'twitter':
        baseClasses += 'bg-black hover:bg-gray-800 text-white ';
        break;
      case 'facebook':
        baseClasses += 'bg-[#1877F2] hover:bg-[#166FE5] text-white ';
        break;
      case 'linkedin':
        baseClasses += 'bg-[#0077B5] hover:bg-[#006699] text-white ';
        break;
      case 'whatsapp':
        baseClasses += 'bg-[#25D366] hover:bg-[#20BD5C] text-white ';
        break;
    }
    
    if (className) {
      baseClasses += className;
    }
    
    return baseClasses;
  };
  
  return (
    <Button
      variant={iconOnly ? "outline" : "default"}
      size={iconOnly ? "icon" : "sm"}
      className={iconOnly ? className : getButtonClasses()}
      onClick={handleClick}
      aria-label={`Compartir en ${getNetworkName()}`}
    >
      {icon}
      {!iconOnly && getNetworkName()}
    </Button>
  );
};

// Componente para mostrar un logro compartido
const ShareAchievementPage: React.FC = () => {
  const [, params] = useRoute('/share-achievement/:id');
  const [achievement, setAchievement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Obtener los datos del logro
  useEffect(() => {
    if (!params?.id) return;
    
    const achievementId = params.id;
    setLoading(true);
    
    apiRequest('GET', `/api/micro-interactions/public/achievements/${achievementId}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo encontrar el logro');
        return res.json();
      })
      .then(data => {
        setAchievement(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error al cargar el logro:', err);
        setError('No pudimos encontrar el logro que estás buscando');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params?.id]);
  
  // Función para copiar enlace
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    
    toast({
      title: 'Enlace copiado',
      description: 'El enlace ha sido copiado al portapapeles',
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <img src={logo} alt="Cerfidoc Logo" className="h-12 mx-auto mb-4" />
            <CardTitle>Cargando logro...</CardTitle>
            <CardDescription>
              Estamos recuperando la información del logro
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-24 w-24 bg-primary/10 rounded-full mb-4"></div>
              <div className="h-4 bg-primary/10 rounded w-48 mb-2"></div>
              <div className="h-3 bg-primary/10 rounded w-32"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <img src={logo} alt="Cerfidoc Logo" className="h-12 mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Logro no encontrado
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Award className="h-20 w-20 text-muted-foreground/30" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Ir a la página principal
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="Cerfidoc Logo" className="h-12 mx-auto mb-4" />
          <CardTitle>Logro desbloqueado</CardTitle>
          <CardDescription>
            {achievement?.userName || 'Un usuario'} ha desbloqueado un logro en Cerfidoc
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="relative p-1 rounded-md border">
            <div className="absolute top-0 right-0 z-10 mt-2 mr-2">
              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <Card className="bg-card/50 border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{achievement?.name}</CardTitle>
                <CardDescription>
                  Nivel {achievement?.level || 1} - Certificación de documentos
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="flex-shrink-0">
                    {achievement?.badgeImageUrl ? (
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
                  <div>
                    <p className="text-sm">{achievement?.description}</p>
                    
                    {achievement?.rewardPoints && (
                      <p className="text-xs font-medium text-primary mt-1">
                        +{achievement.rewardPoints} puntos
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Cerfidoc es la plataforma líder de verificación de documentos digitales en Chile.</p>
              <p className="mt-1">¡Únete hoy y comienza a desbloquear logros!</p>
            </div>
            
            {/* Social Media Sharing Buttons */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3 text-center">Compartir este logro</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Twitter/X */}
                <SocialShareButton 
                  network="twitter" 
                  shareUrl={window.location.href}
                  title={`¡Mira este logro "${achievement?.name}" en Cerfidoc! #VerificaciónDigital #Cerfidoc`}
                  icon={
                    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  }
                />
                
                {/* Facebook */}
                <SocialShareButton 
                  network="facebook" 
                  shareUrl={window.location.href}
                  quote={`¡Mira este logro "${achievement?.name}" en Cerfidoc!`}
                  icon={
                    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                    </svg>
                  }
                />
                
                {/* LinkedIn */}
                <SocialShareButton 
                  network="linkedin" 
                  shareUrl={window.location.href}
                  title={`Logro "${achievement?.name}" en Cerfidoc`}
                  summary={achievement?.description || "Plataforma de verificación de documentos digitales"}
                  icon={
                    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  }
                />
                
                {/* WhatsApp */}
                <SocialShareButton 
                  network="whatsapp" 
                  shareUrl={window.location.href}
                  title={`¡Mira este logro "${achievement?.name}" en Cerfidoc! 🏆`}
                  icon={
                    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M11.999 21.75h-.03a9.702 9.702 0 0 1-4.935-1.34l-.354-.21-3.67.964.981-3.583-.23-.37a9.68 9.68 0 0 1-1.482-5.182c.001-5.354 4.359-9.71 9.715-9.71 2.595.001 5.031 1.01 6.865 2.845a9.627 9.627 0 0 1 2.844 6.867c-.002 5.354-4.359 9.71-9.714 9.71zm0-18.66A8.242 8.242 0 0 0 3.76 11.326a8.096 8.096 0 0 0 1.282 4.36L3.69 20.75l5.21-1.366a8.254 8.254 0 0 0 3.07.586h.03a8.242 8.242 0 0 0 8.24-8.245 8.16 8.16 0 0 0-2.44-5.83 8.174 8.174 0 0 0-5.8-2.406z" />
                    </svg>
                  }
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Conocer más
                </Button>
              </Link>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="secondary"
                      size="icon"
                      onClick={copyLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar enlace</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="justify-center text-xs text-muted-foreground border-t pt-4">
          #CerfidocVerificación #CertificaciónDigital
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShareAchievementPage;