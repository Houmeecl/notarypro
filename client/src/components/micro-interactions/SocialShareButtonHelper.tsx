import React from 'react';
import { Button } from '@/components/ui/button';

// Componente para botones de compartir en redes sociales
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
        return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(title)}`;
      default:
        return '#';
    }
  };
  
  // Manejar clic en el botón de compartir
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Obtener la URL para compartir
    const shareUrl = getShareUrl();
    
    // Manejar casos especiales para mobile
    if (network === 'whatsapp' && /Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)) {
      // En dispositivos móviles, abre WhatsApp en la misma ventana
      window.location.href = shareUrl;
      return;
    }
    
    // Para Instagram, solo intentar abrir la app (no funcionará en desktop)
    if (network === 'instagram') {
      try {
        window.location.href = shareUrl;
      } catch (e) {
        // Fallback - mostrar un mensaje o notificación
        console.log('Instagram app no disponible. Se requiere la app para compartir.');
      }
      return;
    }
    
    // Para otras redes, abrir ventana popup
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
  
  // Obtener el nombre de la red social para accesibilidad
  const getNetworkName = () => {
    switch (network) {
      case 'twitter': return 'Twitter/X';
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'whatsapp': return 'WhatsApp';
      case 'instagram': return 'Instagram';
      case 'pinterest': return 'Pinterest';
      default: return network;
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size === "icon" && !showLabel ? "icon" : size}
      className={className}
      onClick={handleClick}
      aria-label={`Compartir en ${getNetworkName()}`}
    >
      {icon}
      {showLabel && (displayText || getNetworkName())}
    </Button>
  );
};

export default SocialShareButtonHelper;