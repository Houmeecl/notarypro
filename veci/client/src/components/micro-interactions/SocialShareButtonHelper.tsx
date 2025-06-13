import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialShareButtonHelperProps {
  network: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'instagram' | 'pinterest';
  shareUrl: string;
  title?: string;
  summary?: string;
  quote?: string;
  hashtags?: string[];
  icon: React.ReactNode;
  className?: string;
  displayText?: string;
  showLabel?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Componente helper para compartir logros en redes sociales
 * Permite compartir un enlace en las principales plataformas sociales
 * con la opción de personalizar los mensajes para cada plataforma
 */
export const SocialShareButtonHelper: React.FC<SocialShareButtonHelperProps> = ({ 
  network, 
  shareUrl, 
  title = '', 
  summary = '', 
  quote = '',
  hashtags = [],
  icon, 
  className = '',
  displayText,
  showLabel = false,
  variant = "outline",
  size = "sm"
}) => {
  // Generar la URL de compartir según la red social
  const getShareUrl = () => {
    const hashtagsString = hashtags.length > 0 ? `&hashtags=${encodeURIComponent(hashtags.join(','))}` : '';
    
    switch (network) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}${hashtagsString}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${encodeURIComponent((title ? title + ' ' : '') + shareUrl)}`;
      case 'instagram':
        // Instagram no tiene API de compartir directa, pero podemos redirigir a la app
        return `instagram://camera`;
      case 'pinterest':
        return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=&description=${encodeURIComponent(title)}`;
      default:
        return shareUrl;
    }
  };
  
  // Abrir ventana emergente para compartir
  const handleShare = () => {
    const url = getShareUrl();
    
    if (network === 'instagram') {
      // Para Instagram abrimos en la misma ventana ya que tiene que ser manejado por la app
      window.location.href = url;
      return;
    }
    
    // Para otras redes, abrimos popup
    const windowWidth = 600;
    const windowHeight = 400;
    const left = (window.innerWidth - windowWidth) / 2;
    const top = (window.innerHeight - windowHeight) / 2;
    
    window.open(
      url,
      `share-${network}`,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${windowWidth}, height=${windowHeight}, top=${top}, left=${left}`
    );
  };
  
  // Nombres de las redes para tooltips
  const getNetworkName = () => {
    switch (network) {
      case 'twitter': return 'Twitter/X';
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'whatsapp': return 'WhatsApp';
      case 'instagram': return 'Instagram';
      case 'pinterest': return 'Pinterest';
      default: return 'Compartir';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleShare}
            className={className}
            aria-label={`Compartir en ${getNetworkName()}`}
          >
            {icon}
            {showLabel && <span className="ml-2">{displayText || getNetworkName()}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compartir en {getNetworkName()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SocialShareButtonHelper;