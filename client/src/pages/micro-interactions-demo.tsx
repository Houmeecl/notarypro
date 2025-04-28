import React from 'react';
import { useMicroInteractions, MicroInteractionEvent } from '@/hooks/use-micro-interactions';
import { Button } from '@/components/ui/button';
import { AchievementsList } from '@/components/micro-interactions/AchievementsList';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { Award, Bell, Star, Zap, Gift, Trophy, Calendar, BadgeCheck, Share2, MessageSquare, Target, DollarSign, GraduationCap, Flame } from 'lucide-react';

const MicroInteractionsDemo: React.FC = () => {
  const { user } = useAuth();
  const { 
    triggerInteraction, 
    interactionHistory, 
    isLoadingHistory,
    achievements,
    isLoadingAchievements
  } = useMicroInteractions();

  // Lista de todas las interacciones disponibles para probar
  const availableInteractions: { name: string; event: MicroInteractionEvent; icon: React.ReactNode }[] = [
    { name: 'Ver documento', event: 'document_view', icon: <Bell className="h-4 w-4" /> },
    { name: 'Firmar documento', event: 'document_sign', icon: <BadgeCheck className="h-4 w-4" /> },
    { name: 'Iniciar videollamada', event: 'video_call_start', icon: <Bell className="h-4 w-4" /> },
    { name: 'Finalizar videollamada', event: 'video_call_end', icon: <Bell className="h-4 w-4" /> },
    { name: 'Actualizar perfil', event: 'profile_update', icon: <Bell className="h-4 w-4" /> },
    { name: 'Login consecutivo', event: 'consecutive_login', icon: <Calendar className="h-4 w-4" /> },
    { name: 'Primera verificación', event: 'first_verification', icon: <BadgeCheck className="h-4 w-4" /> },
    { name: 'Subir de nivel', event: 'level_up', icon: <Star className="h-4 w-4" /> },
    { name: 'Desbloquear logro', event: 'achievement_unlock', icon: <Trophy className="h-4 w-4" /> },
    { name: 'Compartir documento', event: 'document_share', icon: <Share2 className="h-4 w-4" /> },
    { name: 'Enviar feedback', event: 'feedback_submitted', icon: <MessageSquare className="h-4 w-4" /> },
    { name: 'Completar desafío', event: 'challenge_complete', icon: <Target className="h-4 w-4" /> },
    { name: 'Realizar compra', event: 'purchase', icon: <DollarSign className="h-4 w-4" /> },
    { name: 'Completar curso', event: 'course_complete', icon: <GraduationCap className="h-4 w-4" /> },
    { name: 'Hito de días consecutivos', event: 'streak_milestone', icon: <Flame className="h-4 w-4" /> },
  ];

  // Agrupar por tipo
  const interactionsByType = availableInteractions.reduce((acc, item) => {
    // Grupos: Documentos, Video, Perfil, Logros, Social, Compras, Aprendizaje
    let group = 'Otros';
    
    if (['document_view', 'document_sign', 'document_share'].includes(item.event)) {
      group = 'Documentos';
    } else if (['video_call_start', 'video_call_end'].includes(item.event)) {
      group = 'Video';
    } else if (['profile_update', 'consecutive_login'].includes(item.event)) {
      group = 'Perfil';
    } else if (['level_up', 'achievement_unlock', 'challenge_complete', 'streak_milestone'].includes(item.event)) {
      group = 'Logros';
    } else if (['feedback_submitted'].includes(item.event)) {
      group = 'Social';
    } else if (['purchase'].includes(item.event)) {
      group = 'Compras';
    } else if (['course_complete', 'first_verification'].includes(item.event)) {
      group = 'Aprendizaje';
    }
    
    if (!acc[group]) {
      acc[group] = [];
    }
    
    acc[group].push(item);
    return acc;
  }, {} as Record<string, typeof availableInteractions>);

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para acceder a esta página de demostración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Las micro-interacciones requieren un usuario autenticado para funcionar correctamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Demostración de Micro-Interacciones</h1>
      <p className="text-muted-foreground mb-8">
        Esta página te permite probar las diferentes micro-interacciones del sistema y ver cómo funcionan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Desencadenadores de interacciones</CardTitle>
              <CardDescription>
                Haz clic en cualquier botón para activar una micro-interacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Documentos">
                <TabsList className="mb-4 flex flex-wrap">
                  {Object.keys(interactionsByType).map(group => (
                    <TabsTrigger key={group} value={group} className="text-xs sm:text-sm">
                      {group}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(interactionsByType).map(([group, interactions]) => (
                  <TabsContent key={group} value={group} className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {interactions.map((interaction) => (
                        <Button
                          key={interaction.event}
                          variant="outline"
                          className="justify-start text-sm h-auto py-3"
                          onClick={() => triggerInteraction(interaction.event, { 
                            context: 'demo',
                            source: 'demo_page'
                          })}
                        >
                          <div className="mr-2 text-primary">{interaction.icon}</div>
                          {interaction.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de interacciones</CardTitle>
              <CardDescription>
                Registro de las últimas interacciones activadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
                    aria-label="Cargando" />
                </div>
              ) : interactionHistory.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mb-4 text-muted-foreground/50" />
                  <p>No hay interacciones registradas</p>
                  <p className="text-sm mt-1">Prueba a activar alguna de las interacciones disponibles</p>
                </div>
              ) : (
                <ScrollArea className="h-60 rounded-md border">
                  <div className="p-4 space-y-4">
                    {interactionHistory.map((interaction, i) => (
                      <div key={i} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{interaction.name || interaction.triggerEvent}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(interaction.timestamp).toLocaleString()}</p>
                          {interaction.pointsAwarded > 0 && (
                            <p className="text-xs text-primary mt-1">+{interaction.pointsAwarded} puntos</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Logros
              </CardTitle>
              <CardDescription>
                Logros desbloqueados y en progreso
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-auto pb-0">
              <AchievementsList showLocked={true} />
            </CardContent>
            <CardFooter className="py-3 justify-between">
              <p className="text-xs text-muted-foreground">
                {achievements.filter(a => a.unlocked).length} de {achievements.length} logros desbloqueados
              </p>
              <Button variant="link" size="sm" className="h-auto p-0">
                Ver todos
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Puntos de experiencia
              </CardTitle>
              <CardDescription>
                Tu progreso y nivel actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">5</span>
                </div>
                <h3 className="text-lg font-semibold">Nivel 5</h3>
                <p className="text-sm text-muted-foreground">Certificador en formación</p>
                
                <div className="mt-6 w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span>1,250 XP</span>
                    <span>2,000 XP</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '62.5%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    750 XP más para nivel 6
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MicroInteractionsDemo;