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