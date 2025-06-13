import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Shield,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import DocumentVerificationShareModal from "../micro-interactions/DocumentVerificationShareModal";

interface VerificationRewardsProps {
  verificationCode: string;
  userId?: number;
  isAuthenticated: boolean;
  onGetStarted: () => void;
}

/**
 * Componente que muestra recompensas por verificación de documentos
 * y permite compartir los logros en redes sociales
 */
const VerificationRewards: React.FC<VerificationRewardsProps> = ({
  verificationCode,
  userId,
  isAuthenticated,
  onGetStarted,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Obtener detalles de la verificación del documento
  const {
    data: verification,
    isLoading: isLoadingVerification,
  } = useQuery({
    queryKey: [`/api/documents/verification/${verificationCode}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/documents/verification/${verificationCode}`);
      return await response.json();
    },
    enabled: !!verificationCode,
  });

  // Si el usuario está autenticado, obtener estadísticas de verificación
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ["/api/gamification/verification-stats", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/gamification/verification-stats");
      return await response.json();
    },
    enabled: !!userId && isAuthenticated,
  });

  // Si el usuario está autenticado, obtener logros
  const {
    data: achievements,
    isLoading: isLoadingAchievements,
  } = useQuery({
    queryKey: ["/api/gamification/badges", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/gamification/badges");
      return await response.json();
    },
    enabled: !!userId && isAuthenticated,
  });

  // Mostrar confetti cuando se carga el componente
  useEffect(() => {
    if (verification?.verified) {
      setShowConfetti(true);
      
      // Ocultar el confetti después de 5 segundos
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [verification]);

  // Encontrar el logro relacionado con la verificación de documentos si existe
  const verificationAchievement = achievements?.find(
    (achievement: any) => achievement.category === "document_verification"
  );

  // Si está cargando, mostrar nada
  if (isLoadingVerification) return null;

  // Si el documento no fue verificado exitosamente, no mostrar recompensas
  if (!verification?.verified) return null;

  return (
    <div className="mt-6">
      {showConfetti && <Confetti />}
      
      <Card className="border-green-100 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            ¡Verificación exitosa!
          </CardTitle>
          <CardDescription>
            Has verificado con éxito el documento <strong>{verification.documentTitle}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Si el usuario está autenticado, mostrar recompensas y estadísticas */}
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* Estadísticas de verificación */}
              {!isLoadingStats && stats && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-md p-3 flex items-center gap-3 shadow-sm">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{stats.totalVerifications || 0}</div>
                      <div className="text-xs text-muted-foreground">Verificaciones</div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-md p-3 flex items-center gap-3 shadow-sm">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{stats.percentile || 0}%</div>
                      <div className="text-xs text-muted-foreground">Percentil</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logros de verificación */}
              {verificationAchievement && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-border">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-full">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{verificationAchievement.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {verificationAchievement.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-primary">
                          +{verificationAchievement.rewardPoints || 50} puntos
                        </div>
                        
                        {/* Botón para compartir el logro */}
                        <DocumentVerificationShareModal
                          documentVerification={{
                            id: verification.id,
                            documentId: verification.documentId,
                            documentTitle: verification.documentTitle,
                            documentCode: verificationCode,
                            verifiedAt: new Date().toISOString(),
                          }}
                          achievement={verificationAchievement}
                          verificationCount={stats?.totalVerifications || 1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Si no hay logros específicos, mostrar opción de compartir genérica */}
              {!verificationAchievement && (
                <div className="flex justify-end">
                  <DocumentVerificationShareModal
                    documentVerification={{
                      id: verification.id,
                      documentId: verification.documentId,
                      documentTitle: verification.documentTitle,
                      documentCode: verificationCode,
                      verifiedAt: new Date().toISOString(),
                    }}
                    verificationCount={stats?.totalVerifications || 1}
                  />
                </div>
              )}
            </div>
          ) : (
            // Si el usuario no está autenticado, mostrar invitación a unirse
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-border">
              <div className="flex items-start gap-3">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">¡Únete para obtener más beneficios!</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Crea una cuenta para ganar insignias, acumular puntos y participar 
                    en el sistema de gamificación de verificación de documentos.
                  </p>
                  
                  <Button 
                    onClick={onGetStarted}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    Comenzar ahora
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 justify-end">
          {/* Siempre permitir compartir, incluso a usuarios no autenticados */}
          {!isAuthenticated && (
            <DocumentVerificationShareModal
              documentVerification={{
                id: verification.id || 0,
                documentId: verification.documentId || 0,
                documentTitle: verification.documentTitle || "Documento verificado",
                documentCode: verificationCode,
                verifiedAt: new Date().toISOString(),
              }}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerificationRewards;