import { useState, useRef } from "react";
import { Shield, Award, Download, ExternalLink, Share, Check, Copy, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { Card, CardContent } from "@/components/ui/card";
import SocialShareButtonHelper from "./SocialShareButtonHelper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentVerificationBadgeProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    level: number;
    badgeImageUrl?: string;
    unlockedAt?: string;
    documentTitle?: string;
    documentCode?: string;
    verificationCount?: number;
  };
  className?: string;
}

/**
 * Componente de insignia compartible específico para logros de verificación de documentos
 */
export const DocumentVerificationBadge: React.FC<DocumentVerificationBadgeProps> = ({ 
  achievement, 
  className = '' 
}) => {
  const { toast } = useToast();
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // URL para compartir el logro
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share-achievement/${achievement.id}` 
    : '';

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
      link.download = `cerfidoc-verificacion-${achievement.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      
      toast({
        title: '¡Imagen descargada!',
        description: 'Tu insignia de verificación ha sido descargada correctamente',
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

  // Función para copiar el enlace al portapapeles
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied(true);
        toast({
          title: '¡Enlace copiado!',
          description: 'El enlace ha sido copiado al portapapeles',
          duration: 3000,
        });
        
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast({
          title: 'Error al copiar',
          description: 'No se pudo copiar el enlace. Inténtalo de nuevo.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div ref={badgeRef} className="rounded-lg overflow-hidden border border-gray-200 bg-card text-card-foreground shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">CerfiDoc Verificación</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="bg-primary-50 dark:bg-primary-950/50 p-3 rounded-md w-24 h-24 flex items-center justify-center">
            {achievement.badgeImageUrl ? (
              <img 
                src={achievement.badgeImageUrl} 
                alt={achievement.name} 
                className="max-w-full max-h-full object-contain" 
              />
            ) : (
              <FileCheck className="w-14 h-14 text-primary/70" />
            )}
          </div>
          
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h3 className="font-medium text-lg">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            
            {achievement.documentTitle && (
              <p className="text-xs font-medium bg-muted px-2 py-1 rounded-sm inline-block">
                Documento: {achievement.documentTitle}
              </p>
            )}
            
            {achievement.verificationCount && (
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-primary">
                <Shield className="h-3 w-3" />
                <span>{achievement.verificationCount} verificaciones</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Nivel {achievement.level}
            </div>
            <div className="text-xs font-medium text-primary">
              Verificación certificada
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <p className="text-sm">
              Comparte este logro de verificación de documento y demuestra tu compromiso con la autenticidad documental.
            </p>
            
            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={downloadBadge}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloading ? 'Procesando...' : 'Descargar'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={copyShareLink}
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copiado' : 'Copiar enlace'}
                </Button>
              </div>
              
              <Button
                variant="default" 
                size="sm"
                onClick={() => {
                  window.open(shareUrl, '_blank');
                }}
              >
                <Share className="h-4 w-4 mr-1" />
                Ver página
              </Button>
            </div>
            
            {/* Social Media Sharing Buttons */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Compartir en redes sociales</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {/* Twitter/X */}
                <SocialShareButtonHelper 
                  network="twitter" 
                  shareUrl={shareUrl}
                  title={`¡He certificado la verificación del documento "${achievement.documentTitle || 'documento'}" en Cerfidoc!`}
                  hashtags={["VerificaciónDigital", "Cerfidoc", "DocumentosElectrónicos"]}
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
                  shareUrl={shareUrl}
                  quote={`¡He certificado la verificación del documento "${achievement.documentTitle || 'documento'}" en Cerfidoc! Plataforma líder de verificación de documentos digitales en Chile.`}
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
                  shareUrl={shareUrl}
                  title={`Verificación de "${achievement.documentTitle || 'documento'}" en Cerfidoc`}
                  summary={`He completado la verificación oficial del documento a través de la plataforma de certificación digital líder en Chile`}
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  }
                  size="icon"
                />
                
                {/* WhatsApp */}
                <SocialShareButtonHelper 
                  network="whatsapp" 
                  shareUrl={shareUrl}
                  title={`¡He verificado el documento "${achievement.documentTitle || 'documento'}" en Cerfidoc! Mira mi insignia de verificación:`}
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  }
                  size="icon"
                />
                
                {/* Instagram */}
                <SocialShareButtonHelper 
                  network="instagram" 
                  shareUrl={shareUrl}
                  title={`¡He verificado el documento "${achievement.documentTitle || 'documento'}" en Cerfidoc!`}
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  }
                  size="icon"
                />
                
                {/* Pinterest */}
                <SocialShareButtonHelper 
                  network="pinterest" 
                  shareUrl={shareUrl}
                  title={`Verificación de documentos digitales certificada - ${achievement.name}`}
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                    </svg>
                  }
                  size="icon"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentVerificationBadge;