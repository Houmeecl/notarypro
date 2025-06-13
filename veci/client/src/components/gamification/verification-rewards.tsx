import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Trophy,
  Award,
  Star,
  Gift,
  ChevronRight,
  Medal,
  Shield,
  TrendingUp,
  User,
  Crown,
  Calendar,
  Check,
  AlertCircle,
  Clock
} from "lucide-react";

interface VerificationRewardsProps {
  verificationCode: string;
  userId?: number;
  isAuthenticated: boolean;
  onGetStarted: () => void;
}

export function VerificationRewards({
  verificationCode,
  userId,
  isAuthenticated,
  onGetStarted
}: VerificationRewardsProps) {
  const [rewards, setRewards] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const { toast } = useToast();

  // Si el usuario está autenticado, obtener recompensas de gamificación
  useEffect(() => {
    if (isAuthenticated && verificationCode) {
      fetchVerificationRewards();
    }
  }, [isAuthenticated, verificationCode]);

  // Procesar la verificación con gamificación
  const fetchVerificationRewards = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/gamification/process-verification", {
        verificationCode
      });
      
      if (!response.ok) {
        throw new Error("Error al procesar la verificación");
      }

      const data = await response.json();
      setRewards(data);
      
      // Activar efecto con un pequeño retraso para dar animación
      setTimeout(() => setShowEffects(true), 300);
    } catch (error) {
      console.error("Error obteniendo recompensas:", error);
      toast({
        title: "Error",
        description: "No se pudieron obtener las recompensas de verificación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario no está autenticado, mostrar invitación a registrarse
  if (!isAuthenticated) {
    return (
      <Card className="mt-6 overflow-hidden border-2 border-primary/20 shadow-sm">
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="flex items-center text-lg">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            ¡Gana Recompensas por Verificar!
          </CardTitle>
          <CardDescription>
            Crea una cuenta para ganar puntos e insignias por verificar documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="font-medium text-sm mb-1">Insignias Exclusivas</h3>
              <p className="text-xs text-gray-600">Colecciona insignias por verififcar regularmente</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
              <Star className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-medium text-sm mb-1">Puntos y Niveles</h3>
              <p className="text-xs text-gray-600">Sube de nivel y desbloquea nuevas recompensas</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
              <Gift className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-medium text-sm mb-1">Premios Reales</h3>
              <p className="text-xs text-gray-600">Canjea tus puntos por descuentos y beneficios</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-3 bg-gray-50 flex justify-between">
          <div className="text-xs text-gray-500">
            ¡Más de 1,000 usuarios ya participan!
          </div>
          <Button 
            size="sm" 
            onClick={onGetStarted}
            className="gap-1"
          >
            Comenzar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Si está cargando
  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            Procesando verificación...
          </CardTitle>
          <CardDescription>
            Estamos calculando tus puntos y recompensas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay recompensas
  if (rewards) {
    return (
      <Card className={`mt-6 overflow-hidden border-2 border-primary/20 shadow-md transition-all duration-300 ${showEffects ? 'animate-in fade-in zoom-in-95' : ''}`}>
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="flex items-center text-lg">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            ¡Verificación Recompensada!
          </CardTitle>
          <CardDescription>
            Has ganado {rewards.pointsEarned} puntos por verificar este documento
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4 pb-2 space-y-4">
          {/* Desafíos Completados */}
          {rewards.completedChallenges && rewards.completedChallenges.length > 0 && (
            <div className={`space-y-3 transition-opacity duration-500 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-sm font-medium flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                Desafíos Completados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rewards.completedChallenges.map((challenge: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 rounded-md bg-green-50 border border-green-100"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="bg-green-100 p-1.5 rounded-full mr-2">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-medium text-green-800">{challenge.title}</h4>
                      <p className="text-xs text-green-600">+{challenge.points} puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Nuevas Insignias */}
          {rewards.newBadges && rewards.newBadges.length > 0 && (
            <div className={`space-y-3 transition-opacity duration-500 ${showEffects ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
              <h3 className="text-sm font-medium flex items-center">
                <Medal className="h-4 w-4 mr-1 text-amber-500" />
                ¡Nuevas Insignias Desbloqueadas!
              </h3>
              <div className="flex flex-wrap gap-2">
                {rewards.newBadges.map((badge: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`py-1 px-3 flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200`}
                  >
                    <Star className="h-3 w-3 text-amber-500" />
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Subida de Nivel */}
          {rewards.levelUp && (
            <div className={`rounded-md border border-blue-200 bg-blue-50 p-3 transition-all duration-500 ${showEffects ? 'animate-in slide-in-from-bottom-3' : ''}`} style={{ transitionDelay: '600ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">¡Has subido al nivel {rewards.newLevel}!</h3>
                    <p className="text-xs text-blue-600">Desbloquea nuevas recompensas y funciones</p>
                  </div>
                </div>
                <div className="bg-blue-600 text-white text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center">
                  {rewards.newLevel}
                </div>
              </div>
            </div>
          )}
          
          {/* Resumen de Puntos */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total ganado</span>
              <span className="font-bold text-primary">+{rewards.pointsEarned} puntos</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-3 bg-gray-50 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <User className="h-4 w-4 mr-1" />
            Ver Perfil
          </Button>
          <Button size="sm" variant="default">
            <Star className="h-4 w-4 mr-1" />
            Ver Ranking
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Fallback - no hay recompensas aún
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-primary" />
          ¿Quieres ganar puntos?
        </CardTitle>
        <CardDescription>
          Verifica documentos y gana recompensas en nuestra plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Presiona "Verificar" para comenzar a acumular puntos y ganar insignias exclusivas.
        </p>
      </CardContent>
    </Card>
  );
}