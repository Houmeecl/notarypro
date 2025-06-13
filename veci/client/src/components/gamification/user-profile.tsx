import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  User,
  Trophy,
  Medal,
  Award,
  Star,
  Gift,
  Clock,
  TrendingUp,
  Shield,
  Target,
  Calendar,
  Check,
  ChevronRight,
  ChevronUp
} from "lucide-react";

interface UserProfileProps {
  userId: number;
  compact?: boolean;
}

export function UserProfile({ userId, compact = false }: UserProfileProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("GET", "/api/gamification/profile");
      
      if (!response.ok) {
        throw new Error("Error al obtener el perfil de gamificación");
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar tu perfil de gamificación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return format(date, "d MMM yyyy", { locale: es });
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  if (loading) {
    // Skeleton loader
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-28 bg-gray-100 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mb-3"></div>
            <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-100 rounded"></div>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded mt-3"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded p-2">
                <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Perfil de Gamificación
          </CardTitle>
          <CardDescription>
            No se encontró tu perfil de gamificación
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-gray-500 mb-4">
            Comienza a verificar documentos para crear tu perfil
          </p>
          <Button>Empezar ahora</Button>
        </CardContent>
      </Card>
    );
  }

  // Perfil completo
  return (
    <Card className={compact ? "shadow-sm" : "shadow-md"}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" />
          Perfil de Gamificación
        </CardTitle>
        <CardDescription>
          Tu progreso como verificador de documentos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="h-16 w-16 mb-2 border-2 border-primary">
              <AvatarFallback className="bg-primary text-white">
                {profile.profile.rank ? profile.profile.rank.substring(0, 2).toUpperCase() : "VP"}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -top-1 -right-1 bg-primary text-white">
              {profile.profile.level}
            </Badge>
          </div>
          <h3 className="font-bold text-lg">{profile.profile.rank}</h3>
          <div className="flex items-center text-xs text-gray-500">
            <Trophy className="h-3 w-3 mr-1 text-primary" />
            <span>Nivel {profile.profile.level}</span>
          </div>
        </div>
        
        {/* Progreso al siguiente nivel */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Nivel {profile.profile.level}</span>
            <span className="text-gray-500">Nivel {profile.nextLevel.level}</span>
          </div>
          <Progress value={profile.nextLevel.progressPercent} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{profile.profile.totalPoints} puntos actuales</span>
            <span className="text-primary font-medium">
              +{profile.nextLevel.pointsToNextLevel} para el siguiente nivel
            </span>
          </div>
        </div>
        
        {/* Estadísticas principales */}
        <div className="grid grid-cols-3 gap-2 text-center mt-2">
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Verificaciones</p>
            <p className="font-bold text-lg text-gray-900">{profile.profile.totalVerifications}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Racha</p>
            <p className="font-bold text-lg text-gray-900">{profile.profile.consecutiveDays} <span className="text-xs font-normal">días</span></p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Puntos</p>
            <p className="font-bold text-lg text-primary">{profile.profile.totalPoints}</p>
          </div>
        </div>
        
        {!compact && (
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="overview" className="text-xs">Resumen</TabsTrigger>
              <TabsTrigger value="badges" className="text-xs">Insignias</TabsTrigger>
              <TabsTrigger value="challenges" className="text-xs">Desafíos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-2 space-y-4">
              {/* Posición en ranking */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                  Tu clasificación
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {profile.leaderboard.monthly && (
                    <div className="flex items-center p-2 rounded bg-amber-50 border border-amber-100">
                      <div className="rounded-full bg-amber-100 p-1.5 mr-2">
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-900">
                          Posición #{profile.leaderboard.monthly.rank}
                        </p>
                        <p className="text-xs text-amber-700">Mensual</p>
                      </div>
                    </div>
                  )}
                  
                  {profile.leaderboard.total && (
                    <div className="flex items-center p-2 rounded bg-blue-50 border border-blue-100">
                      <div className="rounded-full bg-blue-100 p-1.5 mr-2">
                        <Medal className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Posición #{profile.leaderboard.total.rank}
                        </p>
                        <p className="text-xs text-blue-700">General</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actividades recientes */}
              {profile.recentActivities && profile.recentActivities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    Actividad reciente
                  </h3>
                  <div className="space-y-1 text-sm">
                    {profile.recentActivities.slice(0, 3).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center py-1 border-b border-gray-100">
                        <div className="w-7 flex justify-center">
                          {activity.activityType === "verificacion" && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {activity.activityType === "insignia_ganada" && (
                            <Award className="h-4 w-4 text-amber-500" />
                          )}
                          {activity.activityType === "nivel_subido" && (
                            <ChevronUp className="h-4 w-4 text-blue-500" />
                          )}
                          {activity.activityType === "desafio_completado" && (
                            <Target className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate text-gray-700">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                        {activity.pointsEarned > 0 && (
                          <div className="text-xs font-medium text-primary">
                            +{activity.pointsEarned} pts
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="badges" className="mt-2">
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Medal className="h-4 w-4 mr-1 text-amber-500" />
                  Tus Insignias
                </h3>
                
                {profile.badges && profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profile.badges.map((badge: any, index: number) => (
                      <div key={index} className="border rounded-md p-2 flex flex-col items-center text-center">
                        <div className={`rounded-full p-3 mb-1 ${
                          badge.tier === "oro" ? "bg-amber-100" :
                          badge.tier === "plata" ? "bg-gray-100" :
                          badge.tier === "bronce" ? "bg-amber-50" :
                          badge.tier === "platino" ? "bg-blue-100" :
                          badge.tier === "diamante" ? "bg-purple-100" :
                          "bg-gray-100"
                        }`}>
                          <Award className={`h-5 w-5 ${
                            badge.tier === "oro" ? "text-amber-500" :
                            badge.tier === "plata" ? "text-gray-500" :
                            badge.tier === "bronce" ? "text-amber-700" :
                            badge.tier === "platino" ? "text-blue-600" :
                            badge.tier === "diamante" ? "text-purple-600" :
                            "text-gray-500"
                          }`} />
                        </div>
                        <h4 className="text-xs font-medium line-clamp-1">{badge.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{badge.description}</p>
                        <p className="text-xs text-primary mt-1">
                          {formatDate(badge.earnedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Aún no tienes insignias</p>
                    <p className="text-xs text-gray-400">Verifica más documentos para ganar insignias</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="challenges" className="mt-2">
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-1 text-purple-500" />
                  Desafíos Activos
                </h3>
                
                {profile.challenges && profile.challenges.length > 0 ? (
                  <div className="space-y-2">
                    {profile.challenges
                      .filter((challenge: any) => !challenge.isCompleted)
                      .slice(0, 3)
                      .map((challenge: any, index: number) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex items-center mb-2">
                            <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                              <Target className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{challenge.title}</h4>
                              <p className="text-xs text-gray-500">{challenge.description}</p>
                            </div>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {challenge.points} pts
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={challenge.progress ? 
                              (challenge.progress.current / challenge.progress.required) * 100 : 0
                            } 
                            className="h-1.5"
                          />
                          
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-500">
                              Dificultad: {challenge.difficultyLevel}/5
                            </span>
                            <span className="text-purple-700 font-medium">
                              {challenge.progress ? 
                                `${challenge.progress.current}/${challenge.progress.required}` : 
                                "0/1"
                              }
                            </span>
                          </div>
                        </div>
                      ))
                    }
                    
                    <h3 className="text-sm font-medium flex items-center mt-4 pt-2 border-t">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      Desafíos Completados
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile.challenges
                        .filter((challenge: any) => challenge.isCompleted)
                        .slice(0, 4)
                        .map((challenge: any, index: number) => (
                          <div key={index} className="flex items-center p-2 border rounded-md bg-green-50">
                            <div className="bg-green-100 p-1.5 rounded-full mr-2">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-green-800 truncate">{challenge.title}</p>
                              <p className="text-xs text-green-600">
                                Completado: {formatDate(challenge.completedAt)}
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-0">
                              +{challenge.points}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No hay desafíos disponibles</p>
                    <p className="text-xs text-gray-400">Verifica tu primer documento para desbloquear desafíos</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {!compact && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="ghost" size="sm">
            Ver Recompensas
          </Button>
          <Button size="sm">
            Ver Perfil Completo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}