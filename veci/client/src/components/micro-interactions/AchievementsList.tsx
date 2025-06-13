import React from 'react';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import { Award, Lock, CheckCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShareableBadge } from './ShareableBadge';

interface AchievementsListProps {
  showLocked?: boolean;
  limit?: number;
  className?: string;
}

/**
 * Componente para mostrar lista de logros del usuario
 */
// Componente botón para compartir logros
interface ShareableButtonProps {
  achievement: any;
}

const ShareableAchievementButton: React.FC<ShareableButtonProps> = ({ achievement }) => {
  const badgeData = {
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    level: achievement.level,
    badgeImageUrl: achievement.icon,
    unlockedAt: achievement.unlockedAt,
    rewardPoints: achievement.rewardPoints,
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 p-0"
          title="Compartir logro"
        >
          <Share2 className="h-3 w-3 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartir logro</DialogTitle>
          <DialogDescription>
            Comparte este logro con tus amigos y colegas
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ShareableBadge achievement={badgeData} className="mx-auto max-w-xs" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AchievementsList: React.FC<AchievementsListProps> = ({ 
  showLocked = true,
  limit,
  className = ''
}) => {
  const { achievements, isLoadingAchievements } = useMicroInteractions();
  
  // Filtrar y ordenar logros
  const filteredAchievements = React.useMemo(() => {
    let filtered = [...achievements];
    
    // Filtrar logros bloqueados si es necesario
    if (!showLocked) {
      filtered = filtered.filter(a => a.unlocked);
    }
    
    // Ordenar: primero los desbloqueados, luego por nivel
    filtered.sort((a, b) => {
      // Primero por estado de desbloqueo
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      
      // Luego por nivel
      return a.level - b.level;
    });
    
    // Limitar cantidad si es necesario
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [achievements, showLocked, limit]);
  
  if (isLoadingAchievements) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!filteredAchievements.length) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle>Aún no hay logros</CardTitle>
          <CardDescription>
            Completa desafíos y acciones para desbloquear logros
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <div className="bg-primary/10 p-6 rounded-full">
            <Award className="h-12 w-12 text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {filteredAchievements.map((achievement) => (
        <Card 
          key={achievement.id} 
          className={`overflow-hidden transition-all ${!achievement.unlocked && 'opacity-60 hover:opacity-80'}`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{achievement.name}</CardTitle>
                <CardDescription>
                  Nivel {achievement.level}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      Desbloqueado hace {formatDistanceToNow(new Date(achievement.unlockedAt), { locale: es, addSuffix: false })}
                    </span>
                  )}
                </CardDescription>
              </div>
              {achievement.unlocked ? (
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
            
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-primary">
                    {achievement.currentValue || 0}/{achievement.threshold}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {achievement.unlocked && (
                    <ShareableAchievementButton achievement={achievement} />
                  )}
                  <Badge 
                    variant={achievement.unlocked ? "default" : "outline"} 
                    className={achievement.unlocked ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : ""}
                  >
                    {achievement.rewardPoints > 0 && `+${achievement.rewardPoints} puntos`}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={Math.min(100, ((achievement.currentValue || 0) / achievement.threshold) * 100)} 
                className="h-1 mt-1"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};