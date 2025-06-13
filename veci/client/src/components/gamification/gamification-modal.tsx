import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Trophy, 
  Star, 
  Gift, 
  Target, 
  ChevronRight, 
  Medal, 
  TrendingUp,
  User,
  Zap,
  Clock,
  Info,
  Calendar,
  ChevronsUp,
  Crown
} from "lucide-react";

interface GamificationModalProps {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function GamificationModal({ trigger, defaultOpen = false, onClose }: GamificationModalProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState("howItWorks");

  // Cuando el modal se cierra
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            Sistema de Gamificación
          </DialogTitle>
          <DialogDescription>
            Verifica documentos, gana puntos y desbloquea recompensas exclusivas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="howItWorks" className="text-xs">
              Cómo Funciona
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs">
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs">
              Clasificación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="howItWorks" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium flex items-center">
                <Zap className="h-5 w-5 mr-1 text-amber-500" />
                ¿Cómo funciona?
              </h3>
              <p className="text-sm text-gray-600">
                Nuestro sistema de gamificación premia tu participación en la verificación de documentos. Acumula puntos, sube de nivel y gana premios reales por contribuir a la autenticidad documental.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 mb-2">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Completa Desafíos</h4>
                <p className="text-xs text-gray-600">
                  Verifica documentos regularmente y completa desafíos especiales para ganar puntos extra
                </p>
              </Card>

              <Card className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Sube de Nivel</h4>
                <p className="text-xs text-gray-600">
                  Acumula puntos para avanzar en niveles y desbloquear nuevas recompensas y funciones
                </p>
              </Card>

              <Card className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 mb-2">
                  <Medal className="h-6 w-6 text-amber-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Gana Insignias</h4>
                <p className="text-xs text-gray-600">
                  Colecciona insignias únicas que muestran tu experiencia y dedicación como verificador
                </p>
              </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border mt-2">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1 text-primary" />
                Cómo ganar puntos:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-gray-700">
                    <span className="font-medium">25 puntos</span> por cada verificación de documento
                  </span>
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-gray-700">
                    <span className="font-medium">50-500 puntos</span> por completar desafíos
                  </span>
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-gray-700">
                    <span className="font-medium">100 puntos</span> por subir de nivel
                  </span>
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-gray-700">
                    <span className="font-medium">100-1000 puntos</span> por mantener rachas de verificación
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center mt-2">
              <Button 
                onClick={() => setActiveTab("rewards")}
                className="gap-1"
              >
                Ver Recompensas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium flex items-center">
                <Gift className="h-5 w-5 mr-1 text-green-500" />
                Recompensas Disponibles
              </h3>
              <p className="text-sm text-gray-600">
                Canjea tus puntos acumulados por descuentos, créditos y beneficios exclusivos
              </p>
            </div>

            <div className="space-y-3">
              <div className="border rounded-md p-3 flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Descuento 10%</h4>
                  <p className="text-xs text-gray-500">
                    10% de descuento en tu próximo documento
                  </p>
                </div>
                <Badge className="mr-2 bg-primary/10 text-primary border-0">
                  1,000 pts
                </Badge>
                <Button size="sm" variant="outline" disabled>Canjear</Button>
              </div>

              <div className="border rounded-md p-3 flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Gift className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Verificación Gratuita</h4>
                  <p className="text-xs text-gray-500">
                    Una verificación de documento gratuita
                  </p>
                </div>
                <Badge className="mr-2 bg-primary/10 text-primary border-0">
                  2,500 pts
                </Badge>
                <Button size="sm" variant="outline" disabled>Canjear</Button>
              </div>

              <div className="border rounded-md p-3 flex items-center">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <Gift className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Descuento Premium</h4>
                  <p className="text-xs text-gray-500">
                    25% de descuento en servicios premium
                  </p>
                </div>
                <Badge className="mr-2 bg-primary/10 text-primary border-0">
                  5,000 pts
                </Badge>
                <Button size="sm" variant="outline" disabled>Canjear</Button>
              </div>

              <div className="border rounded-md p-3 flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <Crown className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Membresía VIP</h4>
                  <p className="text-xs text-gray-500">
                    Acceso a características exclusivas por 1 mes
                  </p>
                </div>
                <Badge className="mr-2 bg-primary/10 text-primary border-0">
                  10,000 pts
                </Badge>
                <Button size="sm" variant="outline" disabled>Canjear</Button>
              </div>
            </div>

            <h3 className="text-base font-medium flex items-center mt-4">
              <Medal className="h-5 w-5 mr-1 text-amber-500" />
              Insignias por Desbloquear
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="border rounded-md p-2 flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-amber-600 mb-1" />
                <h4 className="text-xs font-medium">Iniciado</h4>
                <p className="text-xs text-gray-500">Completa tu primera verificación</p>
                <Badge className="mt-1 text-xs bg-amber-100 text-amber-800 border-0">
                  50 pts
                </Badge>
              </div>

              <div className="border rounded-md p-2 flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-gray-400 mb-1" />
                <h4 className="text-xs font-medium">Verificador Frecuente</h4>
                <p className="text-xs text-gray-500">Verifica más de 25 documentos</p>
                <Badge className="mt-1 text-xs bg-gray-100 text-gray-800 border-0">
                  500 pts
                </Badge>
              </div>

              <div className="border rounded-md p-2 flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-amber-500 mb-1" />
                <h4 className="text-xs font-medium">Verificador Experto</h4>
                <p className="text-xs text-gray-500">Alcanza el nivel 15</p>
                <Badge className="mt-1 text-xs bg-amber-100 text-amber-800 border-0">
                  2,000 pts
                </Badge>
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <Button 
                onClick={() => setActiveTab("leaderboard")}
                className="gap-1"
              >
                Ver Tabla de Clasificación
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium flex items-center">
                <Trophy className="h-5 w-5 mr-1 text-primary" />
                Tabla de Clasificación
              </h3>
              <p className="text-sm text-gray-600">
                Compite con otros usuarios y escala posiciones en nuestros rankings
              </p>
            </div>

            <Tabs defaultValue="total" className="w-full mt-2">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="daily" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Diario
                </TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Semanal
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs flex items-center gap-1">
                  <ChevronsUp className="h-3 w-3" />
                  Mensual
                </TabsTrigger>
                <TabsTrigger value="total" className="text-xs flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Total
                </TabsTrigger>
              </TabsList>

              <TabsContent value="total" className="mt-3">
                <div className="space-y-2">
                  {/* Mockup de tabla de clasificación */}
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center">
                    <div className="w-8 flex justify-center mr-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium">Ana Morales</h4>
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/5">
                          Lvl 28
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Leyenda</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">12,485</span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-gray-300 rounded-md p-3 flex items-center">
                    <div className="w-8 flex justify-center mr-2">
                      <span className="text-gray-500 font-medium">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium">Carlos Peña</h4>
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/5">
                          Lvl 25
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Maestro</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">10,722</span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-amber-600 rounded-md p-3 flex items-center">
                    <div className="w-8 flex justify-center mr-2">
                      <span className="text-amber-700 font-medium">3</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium">Marcela Vega</h4>
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/5">
                          Lvl 22
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Experta</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">9,345</span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </div>
                  </div>

                  <div className="opacity-50 border rounded-md p-3 flex items-center">
                    <div className="w-8 flex justify-center mr-2">
                      <span className="text-gray-500 font-medium">4</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium">Ricardo Soto</h4>
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/5">
                          Lvl 19
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Experto</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">8,210</span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="bg-gray-50 p-4 rounded-md border mt-3">
              <h3 className="text-sm font-medium mb-2">
                Beneficios del Ranking
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Trophy className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                  <span className="text-gray-700">
                    Los <span className="font-medium">3 mejores clasificados</span> cada mes reciben insignias exclusivas
                  </span>
                </li>
                <li className="flex items-start">
                  <Trophy className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                  <span className="text-gray-700">
                    El <span className="font-medium">Top 10</span> obtiene acceso a desafíos y recompensas especiales
                  </span>
                </li>
                <li className="flex items-start">
                  <Trophy className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                  <span className="text-gray-700">
                    <span className="font-medium">Reconocimiento público</span> en la página principal del sistema
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 pt-2 border-t flex justify-between">
          <Button 
            variant="ghost" 
            onClick={handleClose}
          >
            Cerrar
          </Button>
          <Button 
            onClick={handleClose}
          >
            Comenzar a Ganar Puntos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}