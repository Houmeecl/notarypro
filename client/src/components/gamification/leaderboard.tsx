import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Medal, Crown, User, ChevronUp, Calendar, ChevronsUp, Clock } from "lucide-react";

interface LeaderboardProps {
  userId?: number;
  showHeader?: boolean;
  compact?: boolean;
  limit?: number;
}

export function Leaderboard({ userId, showHeader = true, compact = false, limit = 10 }: LeaderboardProps) {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [period, setPeriod] = useState<string>("semanal");
  const [userRanking, setUserRanking] = useState<any | null>(null);
  const { toast } = useToast();

  // Cargar datos del leaderboard
  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  // Si hay un userId, también cargar la posición del usuario
  useEffect(() => {
    if (userId) {
      fetchUserRanking();
    }
  }, [userId, period]);

  // Función para obtener los datos del leaderboard
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("GET", `/api/gamification/leaderboard/${period}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("Error al obtener la tabla de clasificación");
      }
      
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error obteniendo leaderboard:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la tabla de clasificación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la posición del usuario actual
  const fetchUserRanking = async () => {
    try {
      const response = await apiRequest("GET", `/api/gamification/my-rank/${period}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserRanking(data);
      }
    } catch (error) {
      console.error("Error obteniendo ranking del usuario:", error);
    }
  };

  // Renderizar el ícono para la posición
  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-gray-500 font-medium">{position}</span>;
  };

  // Obtener el nombre del período actual
  const getPeriodName = () => {
    switch (period) {
      case "diario": return "Hoy";
      case "semanal": return "Esta Semana";
      case "mensual": return "Este Mes";
      case "total": return "Total";
      default: return period;
    }
  };

  return (
    <Card className={`${compact ? 'shadow-sm' : 'shadow-md'}`}>
      {showHeader && (
        <CardHeader className={`${compact ? 'pb-2' : ''}`}>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            Tabla de Clasificación
          </CardTitle>
          <CardDescription>
            Los mejores verificadores de documentos
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={`${compact ? 'pt-3' : ''}`}>
        <Tabs defaultValue="semanal" onValueChange={setPeriod} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="diario" className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Diario</span>
              <span className="sm:hidden">Día</span>
            </TabsTrigger>
            <TabsTrigger value="semanal" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Semanal</span>
              <span className="sm:hidden">Sem.</span>
            </TabsTrigger>
            <TabsTrigger value="mensual" className="text-xs flex items-center gap-1">
              <Crown className="h-3 w-3" />
              <span className="hidden sm:inline">Mensual</span>
              <span className="sm:hidden">Mes</span>
            </TabsTrigger>
            <TabsTrigger value="total" className="text-xs flex items-center gap-1">
              <ChevronsUp className="h-3 w-3" />
              <span className="hidden sm:inline">Total</span>
              <span className="sm:hidden">Total</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={period} className="mt-0">
            {loading ? (
              // Skeleton loader
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center p-2 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                    </div>
                    <div className="w-12 h-5 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              // Leaderboard
              <div className="space-y-1">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-2 rounded-md transition-colors 
                      ${entry.entry.userId === userId ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50'}`
                    }
                  >
                    <div className="flex items-center justify-center w-8 mr-3">
                      {getRankIcon(entry.entry.rank)}
                    </div>
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {entry.user.username ? entry.user.username.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">
                          {entry.user.fullName || entry.user.username}
                        </p>
                        {entry.gameProfile && entry.gameProfile.level && (
                          <Badge variant="outline" className="ml-2 text-xs px-1 py-0 h-4 bg-primary/5">
                            Lvl {entry.gameProfile.level}
                          </Badge>
                        )}
                      </div>
                      {entry.gameProfile && entry.gameProfile.rank && (
                        <p className="text-xs text-gray-500">{entry.gameProfile.rank}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">{entry.entry.score}</span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </div>
                  </div>
                ))}

                {/* Mensaje si no hay datos */}
                {leaderboard.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No hay datos para mostrar en este período</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Mostrar la posición del usuario actual si está disponible */}
        {userId && userRanking && !loading && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border flex items-center">
            <div className="flex items-center justify-center w-8 mr-3">
              <span className="text-gray-500 text-sm font-medium">#{userRanking.rank}</span>
            </div>
            <Avatar className="h-8 w-8 mr-2 border-2 border-primary">
              <AvatarFallback className="bg-primary text-white text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">Tu posición</p>
              <p className="text-xs text-gray-500">
                De {userRanking.totalParticipants} participantes • {getPeriodName()}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-sm text-primary">{userRanking.score}</span>
              <span className="text-xs text-gray-500 ml-1">pts</span>
            </div>
          </div>
        )}
      </CardContent>
      
      {!compact && (
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="outline" size="sm" className="text-xs">
            Ver todos los participantes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}