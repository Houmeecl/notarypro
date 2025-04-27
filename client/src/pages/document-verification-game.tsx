import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Confetti } from '@/components/ui/confetti';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Medal, Trophy, Star, Award, CheckCircle2, Lock, Shield, Key, Search, ArrowRight, Gift, TrendingUp, Clock, Target, Zap, ChevronRight, Info, AlertCircle, AlertTriangle, ClipboardCopy, BarChart2, LineChart, PieChart } from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilidad para fusionar clases Tailwind
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tipos para nuestros datos
interface GameProfile {
  id: number;
  userId: number;
  totalPoints: number;
  level: number;
  consecutiveDays: number;
  lastActive: Date;
  verificationStreak: number;
  totalVerifications: number;
  rank: string;
  preferences?: any;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  tier: string;
  isRare: boolean;
}

interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: Date;
  showcaseOrder: number | null;
  badge: Badge;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  difficultyLevel: number;
  imageUrl: string | null;
  badgeImage: string | null;
  isActive: boolean;
  requiredActions: any;
  completionCriteria: any;
}

interface ChallengeProgress {
  id: number;
  userId: number;
  challengeId: number;
  progress: any;
  isCompleted: boolean;
  completedAt: Date | null;
  awardedPoints: number | null;
  challenge: Challenge;
}

interface LeaderboardEntry {
  id: number;
  userId: number;
  period: string;
  score: number;
  rank: number;
  username: string;
  fullName: string;
  region?: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  rewardType: string;
  value: number | null;
  requiredPoints: number;
  code: string | null;
  isActive: boolean;
}

interface UserReward {
  id: number;
  userId: number;
  rewardId: number;
  claimedAt: Date;
  status: string;
  redemptionCode: string | null;
  expiresAt: Date | null;
  reward: Reward;
}

interface DocumentVerification {
  id: number;
  code: string;
  documentId: number;
  documentTitle: string;
  verified: boolean;
  verifiedAt: Date | null;
}

interface VerificationStats {
  totalVerifications: number;
  verificationsByDay: { date: string; count: number }[];
  mostVerifiedDocuments: { documentId: number; title: string; count: number }[];
}

const DocumentVerificationGame: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('challenges');
  const [verificationCode, setVerificationCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRewardClaimed, setShowRewardClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState<Reward | null>(null);
  
  // Query para obtener el perfil de juego del usuario
  const { 
    data: gameProfile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: errorProfile
  } = useQuery({
    queryKey: ['/api/gamification/profile'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/profile');
      const data = await response.json();
      return data as GameProfile;
    }
  });
  
  // Query para obtener insignias del usuario
  const {
    data: userBadges,
    isLoading: isLoadingBadges,
  } = useQuery({
    queryKey: ['/api/gamification/badges'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/badges');
      const data = await response.json();
      return data as UserBadge[];
    }
  });
  
  // Query para obtener desafíos
  const {
    data: challenges,
    isLoading: isLoadingChallenges,
  } = useQuery({
    queryKey: ['/api/gamification/challenges'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/challenges');
      const data = await response.json();
      return data as ChallengeProgress[];
    }
  });
  
  // Query para obtener tabla de clasificación
  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
  } = useQuery({
    queryKey: ['/api/gamification/leaderboard'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/leaderboard');
      const data = await response.json();
      return data as LeaderboardEntry[];
    }
  });
  
  // Query para obtener recompensas disponibles
  const {
    data: rewards,
    isLoading: isLoadingRewards,
  } = useQuery({
    queryKey: ['/api/gamification/rewards'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/rewards');
      const data = await response.json();
      return data as Reward[];
    }
  });
  
  // Query para obtener recompensas reclamadas por el usuario
  const {
    data: userRewards,
    isLoading: isLoadingUserRewards,
  } = useQuery({
    queryKey: ['/api/gamification/user-rewards'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/user-rewards');
      const data = await response.json();
      return data as UserReward[];
    }
  });
  
  // Query para obtener estadísticas de verificación
  const {
    data: verificationStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/gamification/verification-stats'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/verification-stats');
      const data = await response.json();
      return data as VerificationStats;
    }
  });
  
  // Mutación para verificar un documento
  const verifyDocumentMutation = useMutation({
    mutationFn: async (code: string) => {
      try {
        // Intentar primero con la ruta de gamificación
        const response = await apiRequest('POST', '/api/gamification/verify-document', { code });
        const data = await response.json();
        return data as DocumentVerification;
      } catch (error) {
        // Si falla, intentar con la ruta alternativa
        const response = await apiRequest('POST', '/api/documents/verify', { code });
        const data = await response.json();
        return data as DocumentVerification;
      }
    },
    onSuccess: (data) => {
      // Refrescar los datos relevantes
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/badges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/verification-stats'] });
      
      if (data.verified) {
        setShowConfetti(true);
        toast({
          title: "¡Documento verificado!",
          description: "Has ganado puntos por verificar este documento.",
        });
        
        // Ocultar confeti después de 4 segundos
        setTimeout(() => {
          setShowConfetti(false);
        }, 4000);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error de verificación",
        description: error.message || "No se pudo verificar el documento. Comprueba el código e intenta nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para reclamar una recompensa
  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await apiRequest('POST', '/api/gamification/claim-reward', { rewardId });
      const data = await response.json();
      return data;
    },
    onSuccess: (data, variables) => {
      // Refrescar los datos relevantes
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user-rewards'] });
      
      // Buscar la recompensa reclamada para mostrarla
      const claimed = rewards?.find(r => r.id === variables);
      if (claimed) {
        setClaimedReward(claimed);
        setShowRewardClaimed(true);
      }
      
      toast({
        title: "¡Recompensa reclamada!",
        description: "Has reclamado una recompensa exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al reclamar",
        description: error.message || "No se pudo reclamar la recompensa. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Manejar la verificación de documento
  const handleVerifyDocument = () => {
    if (!verificationCode) {
      toast({
        title: "Código vacío",
        description: "Por favor ingresa un código de verificación",
        variant: "destructive",
      });
      return;
    }
    
    verifyDocumentMutation.mutate(verificationCode);
    setVerificationCode('');
  };
  
  // Manejar reclamo de recompensa
  const handleClaimReward = (rewardId: number) => {
    claimRewardMutation.mutate(rewardId);
  };
  
  // Determinar el progreso hacia el siguiente nivel
  const calculateLevelProgress = (): number => {
    if (!gameProfile) return 0;
    
    // Puntos necesarios para el siguiente nivel (fórmula exponencial simple)
    const pointsForNextLevel = Math.floor(1000 * Math.pow(1.5, gameProfile.level));
    const pointsForCurrentLevel = Math.floor(1000 * Math.pow(1.5, gameProfile.level - 1));
    const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    const currentLevelPoints = gameProfile.totalPoints - pointsForCurrentLevel;
    
    return Math.min(100, Math.floor((currentLevelPoints / pointsNeeded) * 100));
  };
  
  // Renderizar estrellas para nivel de dificultad
  const renderDifficultyStars = (level: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={i < level ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 text-gray-300"} 
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };
  
  // Obtener color para nivel de insignia
  const getBadgeTierColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'bronce': return 'bg-amber-700 text-white';
      case 'plata': return 'bg-slate-400 text-white';
      case 'oro': return 'bg-yellow-500 text-white';
      case 'platino': return 'bg-cyan-600 text-white';
      case 'diamante': return 'bg-blue-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  // Componente para mostrar contador de racha
  const StreakCounter = ({ count }: { count: number }) => (
    <div className="flex items-center space-x-1 text-orange-500">
      <Zap className="h-5 w-5 fill-orange-500" />
      <span className="font-bold">{count}</span>
    </div>
  );
  
  // Si el usuario no está autenticado
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            Necesitas iniciar sesión para acceder a esta función.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <a href="/auth">Iniciar sesión</a>
        </Button>
      </div>
    );
  }
  
  // Mostrar estado de carga
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground">Cargando tu perfil de juego...</p>
      </div>
    );
  }
  
  // Mostrar error
  if (isErrorProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(errorProfile as Error)?.message || "Ha ocurrido un error al cargar tu perfil de juego."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] })}>
          Intentar nuevamente
        </Button>
      </div>
    );
  }
  
  // Componente para mostrar estadísticas de verificación
  const VerificationStatsCard = () => {
    if (isLoadingStats) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Estadísticas de verificación
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      );
    }

    if (isErrorStats || !verificationStats) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Estadísticas de verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar las estadísticas de verificación.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchStats()}
              className="w-full"
            >
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Estadísticas de verificación
          </CardTitle>
          <CardDescription>
            Resumen de tu actividad de verificación de documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Total de verificaciones</p>
                <p className="text-muted-foreground text-xs">Documentos verificados</p>
              </div>
            </div>
            <div className="text-2xl font-bold">{verificationStats.totalVerifications}</div>
          </div>
          
          {verificationStats.mostVerifiedDocuments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" /> 
                Documentos más verificados
              </h4>
              <div className="space-y-2">
                {verificationStats.mostVerifiedDocuments.slice(0, 3).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="truncate max-w-[180px]">{doc.title}</span>
                    </div>
                    <Badge variant="secondary">{doc.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {verificationStats.verificationsByDay.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <LineChart className="h-4 w-4" /> 
                Actividad reciente
              </h4>
              <div className="h-[100px] flex items-end gap-1">
                {verificationStats.verificationsByDay.slice(-14).map((day, index) => {
                  // Encontrar el valor máximo para normalizar
                  const maxCount = Math.max(...verificationStats.verificationsByDay.map(d => d.count));
                  const heightPercentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  
                  // Formato de fecha para tooltip
                  const date = new Date(day.date);
                  const formattedDate = date.toLocaleDateString('es-ES', { 
                    day: '2-digit',
                    month: '2-digit'
                  });
                  
                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center group relative"
                      title={`${formattedDate}: ${day.count} verificaciones`}
                    >
                      <div 
                        className={`w-full ${day.count > 0 ? 'bg-blue-500' : 'bg-blue-100'} rounded-t-sm transition-all duration-300 hover:bg-blue-600`} 
                        style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                      ></div>
                      <span className="text-[9px] text-muted-foreground mt-1 hidden md:inline">
                        {formattedDate.split('/')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showConfetti && <Confetti />}
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Verifica &amp; Gana</h1>
          <p className="text-muted-foreground">Verifica documentos, completa desafíos y gana recompensas</p>
        </div>
        
        <Card className="w-full md:w-auto min-w-[280px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tu nivel</CardTitle>
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {gameProfile?.level || 1}
                </div>
                <span className="font-semibold">{gameProfile?.rank || "Novato"}</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" /> {gameProfile?.totalPoints || 0} pts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Nivel {gameProfile?.level || 1}</span>
                <span>Nivel {(gameProfile?.level || 1) + 1}</span>
              </div>
              <Progress value={calculateLevelProgress()} className="h-2" />
              
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <StreakCounter count={gameProfile?.consecutiveDays || 0} />
                  </div>
                  <span className="text-xs text-muted-foreground">Días seguidos</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-1 text-blue-500 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">{gameProfile?.totalVerifications || 0}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Verificaciones</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Verificar documento */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Verificar Documento</CardTitle>
          <CardDescription>
            Ingresa el código de verificación para validar la autenticidad del documento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Input
                placeholder="Ingresa el código de verificación (ej: ABC-123456)"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                className="pr-10"
                disabled={verifyDocumentMutation.isPending}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <Button 
              onClick={handleVerifyDocument} 
              disabled={verifyDocumentMutation.isPending}
              className="w-full sm:w-auto"
            >
              {verifyDocumentMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Verificando...
                </>
              ) : (
                <>
                  Verificar <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 pt-3 pb-3 text-sm text-muted-foreground flex items-center gap-2">
          <Info className="h-4 w-4" /> 
          Gana puntos al verificar documentos y completa desafíos para subir de nivel
        </CardFooter>
      </Card>
      
      {/* Sección de estadísticas */}
      <div className="mb-8">
        <VerificationStatsCard />
      </div>
      
      {/* Tabs de contenido principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="challenges">Desafíos</TabsTrigger>
          <TabsTrigger value="badges">Insignias</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
        </TabsList>
        
        {/* TAB: Desafíos */}
        <TabsContent value="challenges" className="space-y-4">
          <h2 className="text-xl font-semibold mt-2">Tus Desafíos</h2>
          
          {isLoadingChallenges ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map(challenge => (
                <Card key={challenge.id} className={cn(
                  "overflow-hidden transition-all",
                  challenge.isCompleted ? "border-green-500" : ""
                )}>
                  {challenge.isCompleted && (
                    <div className="bg-green-500 text-white text-xs py-0.5 text-center">
                      COMPLETADO
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{challenge.challenge.title}</CardTitle>
                      <Badge variant="secondary">+{challenge.challenge.points} pts</Badge>
                    </div>
                    <CardDescription>
                      {renderDifficultyStars(challenge.challenge.difficultyLevel)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{challenge.challenge.description}</p>
                    
                    {challenge.isCompleted ? (
                      <div className="flex items-center text-green-600 font-medium">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Completado
                        {challenge.completedAt && (
                          <span className="text-xs ml-auto text-muted-foreground">
                            {new Date(challenge.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progreso</span>
                          <span>
                            {challenge.progress?.current || 0}/{challenge.challenge.completionCriteria?.target || 0}
                          </span>
                        </div>
                        <Progress 
                          value={((challenge.progress?.current || 0) / (challenge.challenge.completionCriteria?.target || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No hay desafíos disponibles</h3>
              <p className="text-muted-foreground text-sm">
                Verifica documentos para desbloquear desafíos.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* TAB: Insignias */}
        <TabsContent value="badges" className="space-y-4">
          <h2 className="text-xl font-semibold mt-2">Tus Insignias</h2>
          
          {isLoadingBadges ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : userBadges && userBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {userBadges.map(userBadge => (
                <div key={userBadge.id} className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center",
                      getBadgeTierColor(userBadge.badge.tier)
                    )}>
                      <img 
                        src={userBadge.badge.imageUrl} 
                        alt={userBadge.badge.name} 
                        className="w-14 h-14 object-contain"
                      />
                    </div>
                    {userBadge.badge.isRare && (
                      <span className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs px-1 py-0.5 rounded-full">
                        RARO
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-center text-sm">{userBadge.badge.name}</h3>
                  <p className="text-xs text-muted-foreground text-center">{userBadge.badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No tienes insignias aún</h3>
              <p className="text-muted-foreground text-sm">
                Completa desafíos para ganar insignias.
              </p>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <h2 className="text-xl font-semibold">Insignias Bloqueadas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 opacity-60">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="font-medium text-center text-sm">?????</h3>
                <p className="text-xs text-muted-foreground text-center">Desbloquea verificando documentos</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* TAB: Tabla de clasificación */}
        <TabsContent value="leaderboard" className="space-y-4">
          <h2 className="text-xl font-semibold mt-2">Tabla de Clasificación</h2>
          
          {isLoadingLeaderboard ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Mejores Verificadores</CardTitle>
                  <Badge variant="outline">Este mes</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium">Posición</th>
                        <th className="text-left p-3 text-sm font-medium">Usuario</th>
                        <th className="text-left p-3 text-sm font-medium">Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, i) => (
                        <tr key={entry.id} className={cn(
                          "border-b border-muted",
                          entry.userId === user?.id ? "bg-amber-50 dark:bg-amber-950/20" : ""
                        )}>
                          <td className="p-3">
                            <div className="flex items-center">
                              {i === 0 && <Trophy className="h-5 w-5 text-yellow-500 mr-1" />}
                              {i === 1 && <Trophy className="h-5 w-5 text-gray-400 mr-1" />}
                              {i === 2 && <Trophy className="h-5 w-5 text-amber-700 mr-1" />}
                              <span className={cn(
                                "font-semibold",
                                i < 3 ? "text-base" : "text-sm"
                              )}>
                                {i + 1}º
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-medium">{entry.fullName}</span>
                            <span className="text-muted-foreground text-xs block">@{entry.username}</span>
                          </td>
                          <td className="p-3 font-semibold text-primary">{entry.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="py-3 bg-muted/30 text-sm text-muted-foreground flex justify-center">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver ranking completo
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-20" />
              <h3 className="text-lg font-medium mb-1">Tabla de clasificación vacía</h3>
              <p className="text-muted-foreground text-sm">
                Sé el primero en ganar puntos por verificar documentos.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* TAB: Recompensas */}
        <TabsContent value="rewards" className="space-y-4">
          <h2 className="text-xl font-semibold mt-2">Tus Recompensas</h2>
          
          {isLoadingUserRewards ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : userRewards && userRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRewards.map(userReward => (
                <Card key={userReward.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{userReward.reward.name}</CardTitle>
                        <CardDescription>{userReward.reward.description}</CardDescription>
                      </div>
                      <Badge className={cn(
                        userReward.status === 'processed' || userReward.status === 'delivered' 
                          ? "bg-green-500"
                          : userReward.status === 'expired'
                            ? "bg-red-500"
                            : "bg-yellow-500",
                        "text-white"
                      )}>
                        {userReward.status === 'pending' ? 'Pendiente' : 
                         userReward.status === 'processed' ? 'Procesado' :
                         userReward.status === 'delivered' ? 'Entregado' : 'Expirado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded-md">
                      {userReward.redemptionCode ? (
                        <div className="flex flex-col space-y-1">
                          <Label className="text-xs">Código de redención:</Label>
                          <div className="flex items-center space-x-2">
                            <code className="bg-background p-2 rounded border flex-grow text-center font-bold">
                              {userReward.redemptionCode}
                            </code>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(userReward.redemptionCode || '');
                                toast({
                                  title: "Código copiado",
                                  description: "El código ha sido copiado al portapapeles",
                                });
                              }}
                            >
                              <ClipboardCopy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Pendiente de procesamiento</span>
                        </div>
                      )}
                      
                      {userReward.expiresAt && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Expira el: {new Date(userReward.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No tienes recompensas reclamadas</h3>
              <p className="text-muted-foreground text-sm">
                Acumula puntos y reclámalas para obtener beneficios.
              </p>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <h2 className="text-xl font-semibold">Recompensas Disponibles</h2>
          
          {isLoadingRewards ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : rewards && rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(reward => {
                const userCanClaim = (gameProfile?.totalPoints || 0) >= reward.requiredPoints;
                
                return (
                  <Card key={reward.id} className={!userCanClaim ? "opacity-70" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{reward.name}</CardTitle>
                        <Badge variant="outline">
                          {reward.requiredPoints} pts
                        </Badge>
                      </div>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">
                          Tipo:
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {reward.rewardType === 'virtual' ? 'Virtual' : 
                           reward.rewardType === 'descuento' ? 'Descuento' : 
                           reward.rewardType === 'crédito' ? 'Crédito' : 'Físico'}
                        </Badge>
                        
                        {reward.value && (
                          <span className="text-sm font-semibold text-green-600">
                            {reward.rewardType === 'descuento' && `${reward.value}% off`}
                            {reward.rewardType === 'crédito' && `$${reward.value}`}
                          </span>
                        )}
                      </div>
                      
                      {!userCanClaim && (
                        <div className="text-xs text-muted-foreground mb-3 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Necesitas {reward.requiredPoints - (gameProfile?.totalPoints || 0)} puntos más
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full"
                        disabled={!userCanClaim || claimRewardMutation.isPending}
                        onClick={() => handleClaimReward(reward.id)}
                      >
                        {claimRewardMutation.isPending && claimRewardMutation.variables === reward.id ? (
                          <span className="animate-spin mr-2">⏳</span>
                        ) : (
                          <Gift className="h-4 w-4 mr-2" />
                        )}
                        {userCanClaim ? "Reclamar Recompensa" : "Insuficientes Puntos"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No hay recompensas disponibles</h3>
              <p className="text-muted-foreground text-sm">
                Las recompensas se agregarán próximamente.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog para recompensa reclamada */}
      <Dialog open={showRewardClaimed} onOpenChange={setShowRewardClaimed}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Recompensa Reclamada!</DialogTitle>
            <DialogDescription>
              Has reclamado exitosamente esta recompensa.
            </DialogDescription>
          </DialogHeader>
          
          {claimedReward && (
            <div className="flex flex-col items-center p-4">
              <Gift className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-1">{claimedReward.name}</h3>
              <p className="text-center text-muted-foreground mb-4">{claimedReward.description}</p>
              
              <div className="bg-muted p-3 rounded-md w-full text-center">
                <p className="text-sm font-medium mb-1">
                  Tu recompensa ha sido registrada
                </p>
                <p className="text-xs text-muted-foreground">
                  Puedes ver los detalles en la sección "Tus Recompensas"
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2">
            <Button onClick={() => setShowRewardClaimed(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentVerificationGame;