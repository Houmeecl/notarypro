import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, Share2, Shield, AlertCircle, Trophy, Clock } from "lucide-react";
import { VerificationBadge, UserBadge } from "@shared/schema";
import DocumentVerificationBadge from "@/components/micro-interactions/DocumentVerificationBadge";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/hooks/use-websocket";
import { motion } from "framer-motion";

/**
 * Página de Insignias de Usuario
 * 
 * Muestra las insignias obtenidas por el usuario con opciones para:
 * - Filtrar por tipo de insignia
 * - Compartir en redes sociales
 * - Ver detalles de la insignia
 * - Descargar la insignia como imagen
 */
export default function UserBadgesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { status: wsStatus } = useWebSocket();

  // Consultar las insignias del usuario
  const {
    data: userBadges,
    isLoading: isLoadingBadges,
    isError: isBadgesError,
    error: badgesError,
  } = useQuery({
    queryKey: ["/api/micro-interactions/user/badges"],
    queryFn: async () => {
      // Si estamos en desarrollo, podemos devolver datos de ejemplo mientras implementamos
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            id: 1,
            userId: user?.id,
            badgeId: 1,
            earnedAt: new Date().toISOString(),
            badge: {
              id: 1,
              name: "Verificador Novato",
              description: "Completaste tu primera verificación de documento",
              type: "verification",
              level: 1,
              points: 100,
              badgeImage: "/assets/badges/verificador-novato.png",
              createdAt: new Date().toISOString(),
              metadata: {
                documentTitle: "Contrato de Arrendamiento",
                documentCode: "AR-12345",
                verificationCount: 1
              }
            }
          },
          {
            id: 2,
            userId: user?.id,
            badgeId: 2,
            earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            badge: {
              id: 2,
              name: "Certificador Principiante",
              description: "Has certificado tu primer documento",
              type: "certification",
              level: 1,
              points: 200,
              badgeImage: "/assets/badges/certificador-principiante.png",
              createdAt: new Date().toISOString(),
              metadata: {
                documentTitle: "Contrato de Compraventa",
                documentCode: "CV-54321",
                certificationCount: 1
              }
            }
          },
          {
            id: 3,
            userId: user?.id,
            badgeId: 3,
            earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            badge: {
              id: 3,
              name: "Embajador Digital",
              description: "Compartiste 5 documentos verificados",
              type: "social",
              level: 2,
              points: 300,
              badgeImage: "/assets/badges/embajador-digital.png",
              createdAt: new Date().toISOString(),
              metadata: {
                shareCount: 5,
                platforms: ["twitter", "facebook", "whatsapp"]
              }
            }
          }
        ];
      }
      
      const response = await fetch("/api/micro-interactions/user/badges");
      if (!response.ok) {
        throw new Error("Error al cargar las insignias");
      }
      return await response.json();
    },
    enabled: !!user,
  });

  // Filtrar las insignias según los criterios
  const filteredBadges = userBadges?.filter((userBadge) => {
    const badge = userBadge.badge;
    
    // Filtrar por tipo
    if (filterType !== "all" && badge.type !== filterType) {
      return false;
    }
    
    // Filtrar por texto de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        badge.name.toLowerCase().includes(searchLower) ||
        badge.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }) || [];

  // Ordenar las insignias por fecha (más recientes primero)
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
  });

  // Agrupar las insignias por mes
  const groupBadgesByMonth = () => {
    const groups = {};
    
    sortedBadges.forEach((userBadge) => {
      const date = new Date(userBadge.earnedAt);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      
      groups[monthYear].push(userBadge);
    });
    
    return groups;
  };

  const badgesByMonth = groupBadgesByMonth();

  // Renderizar mensaje si no hay insignias
  if (isLoadingBadges) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando tus insignias...</span>
      </div>
    );
  }

  if (isBadgesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-semibold">Error al cargar las insignias</h3>
        <p className="text-muted-foreground">{badgesError?.message || "Ocurrió un error al cargar tus insignias."}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mis Insignias</h1>
            <p className="text-muted-foreground mt-1">
              Colección personal de logros y certificaciones digitales
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={wsStatus === 'connected' ? 'outline' : 'destructive'} className="font-normal">
              {wsStatus === 'connected' ? (
                <>
                  <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                  Conectado
                </>
              ) : (
                <>
                  <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                  Desconectado
                </>
              )}
            </Badge>
            
            <Badge variant="secondary" className="flex items-center gap-1 font-normal">
              <Trophy className="h-3 w-3" />
              <span>{userBadges?.length || 0} Insignias</span>
            </Badge>
          </div>
        </div>
      </header>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar insignias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="verification">Verificación</SelectItem>
              <SelectItem value="certification">Certificación</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="achievement">Logro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="recent">Recientes</TabsTrigger>
          <TabsTrigger value="verification">Verificación</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-8">
          {Object.keys(badgesByMonth).length > 0 ? (
            Object.entries(badgesByMonth).map(([month, badges]) => (
              <div key={month} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">{month}</h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {badges.map((userBadge) => (
                    <BadgeCard 
                      key={userBadge.id}
                      userBadge={userBadge}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-muted inline-flex rounded-full p-6 mb-4">
                <Award className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron insignias</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterType !== "all" 
                  ? "No hay insignias que coincidan con tu búsqueda. Intenta con otros criterios."
                  : "Aún no has ganado ninguna insignia. ¡Comienza a verificar documentos para ganar tu primera insignia!"}
              </p>
              <Link href="/verificar-documento">
                <Button>Verificar un documento</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBadges.slice(0, 6).map((userBadge) => (
              <BadgeCard 
                key={userBadge.id}
                userBadge={userBadge}
              />
            ))}
            
            {sortedBadges.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay insignias recientes</h3>
                <p className="text-muted-foreground">
                  Aún no has ganado ninguna insignia reciente.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="verification">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBadges
              .filter(userBadge => userBadge.badge.type === "verification")
              .map((userBadge) => (
                <BadgeCard 
                  key={userBadge.id}
                  userBadge={userBadge}
                />
              ))}
            
            {sortedBadges.filter(userBadge => userBadge.badge.type === "verification").length === 0 && (
              <div className="text-center py-12 col-span-full">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay insignias de verificación</h3>
                <p className="text-muted-foreground mb-6">
                  Verifica documentos para ganar insignias de verificación.
                </p>
                <Link href="/verificar-documento">
                  <Button>Verificar un documento</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="social">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBadges
              .filter(userBadge => userBadge.badge.type === "social")
              .map((userBadge) => (
                <BadgeCard 
                  key={userBadge.id}
                  userBadge={userBadge}
                />
              ))}
            
            {sortedBadges.filter(userBadge => userBadge.badge.type === "social").length === 0 && (
              <div className="text-center py-12 col-span-full">
                <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay insignias sociales</h3>
                <p className="text-muted-foreground mb-6">
                  Comparte tus verificaciones para ganar insignias sociales.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BadgeCardProps {
  userBadge: any; // Tipo correcto sería UserBadge con relación a badge
}

const BadgeCard: React.FC<BadgeCardProps> = ({ userBadge }) => {
  const badge = userBadge.badge;
  const { toast } = useToast();
  
  // Obtener el color según el tipo de insignia
  const getBadgeTypeColor = (type: string) => {
    switch (type) {
      case 'verification': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'certification': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'social': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'achievement': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Obtener el ícono según el tipo de insignia
  const getBadgeTypeIcon = (type: string) => {
    switch (type) {
      case 'verification': return <Shield className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'social': return <Share2 className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border hover:shadow-md transition-shadow duration-300">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeTypeColor(badge.type)}`}>
                {getBadgeTypeIcon(badge.type)}
                <span className="ml-1">
                  {badge.type === 'verification' && 'Verificación'}
                  {badge.type === 'certification' && 'Certificación'}
                  {badge.type === 'social' && 'Social'}
                  {badge.type === 'achievement' && 'Logro'}
                </span>
              </span>
              <CardTitle className="mt-2 text-lg">{badge.name}</CardTitle>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="text-xs">
                Nivel {badge.level}
              </Badge>
            </div>
          </div>
          <CardDescription className="mt-1">{badge.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-center p-2 bg-muted rounded-md">
            {badge.badgeImage ? (
              <img 
                src={badge.badgeImage} 
                alt={badge.name} 
                className="h-24 w-auto object-contain"
              />
            ) : (
              <div className="h-24 w-24 flex items-center justify-center bg-primary/10 rounded-full">
                {getBadgeTypeIcon(badge.type)}
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Obtenida el {formatDate(userBadge.earnedAt)}
            </p>
            
            {badge.metadata?.documentTitle && (
              <p className="mt-1 truncate" title={badge.metadata.documentTitle}>
                Documento: {badge.metadata.documentTitle}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/share-achievement/${userBadge.id}`);
              toast({
                title: "Enlace copiado",
                description: "Enlace copiado al portapapeles",
              });
            }}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar enlace
          </Button>
          
          <Link href={`/share-achievement/${userBadge.id}`}>
            <Button 
              size="sm"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Compartir
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Para iconos específicos de cada tipo de insignia
const Copy = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);