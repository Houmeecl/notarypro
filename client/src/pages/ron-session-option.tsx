import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Video, ExternalLink, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function RonSessionOption() {
  const params = useParams();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [selectedOption, setSelectedOption] = useState<'internal' | 'external'>('internal');

  // Obtener los datos de la sesión (en una implementación real)
  const sessionId = params.id || 'SESSION-001';
  
  const handleContinue = () => {
    if (selectedOption === 'internal') {
      // Usar el sistema integrado
      navigate(`/ron-session/${sessionId}`);
    } else {
      // Usar Zoom/Meet
      navigate(`/ron-session-external/${sessionId}`);
    }
    
    toast({
      title: "Sesión RON",
      description: selectedOption === 'internal' 
        ? "Iniciando sesión con sistema integrado..."
        : "Configurando sesión con Zoom/Meet...",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader className="border-b border-slate-700">
            <Badge variant="outline" className="self-start mb-2 bg-indigo-500/20 text-indigo-200 border-indigo-300/30">
              Sesión RON: {sessionId}
            </Badge>
            <CardTitle className="text-2xl text-white">Opciones de Videoconferencia RON</CardTitle>
            <CardDescription className="text-slate-300">
              Seleccione cómo desea realizar la videoconferencia para esta sesión de notarización remota.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-2">
            <Tabs 
              defaultValue="internal" 
              value={selectedOption}
              onValueChange={(value) => setSelectedOption(value as 'internal' | 'external')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6 bg-slate-700/50">
                <TabsTrigger value="internal" className="data-[state=active]:bg-primary">
                  <Video className="h-4 w-4 mr-2" />
                  Sistema integrado
                </TabsTrigger>
                <TabsTrigger value="external" className="data-[state=active]:bg-primary">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Zoom / Meet
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="internal" className="space-y-6 min-h-[300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700 rounded-lg p-5 border border-slate-600">
                    <h3 className="text-lg font-medium flex items-center mb-3 text-white">
                      <Video className="h-5 w-5 mr-2 text-indigo-400" />
                      Videoconferencia integrada
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Solución completa sin necesidad de otras aplicaciones</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Grabación automática de la sesión</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Integración de documentos y chat en la misma interfaz</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Proceso de verificación de identidad incorporado</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Sin necesidad de crear cuentas adicionales</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-slate-600 bg-black/30">
                    <img 
                      src="/assets/ron-integrated-preview.jpg" 
                      alt="Vista previa del sistema integrado" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/500x300/384766/FFFFFF?text=Vista+Previa+RON';
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="external" className="space-y-6 min-h-[300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700 rounded-lg p-5 border border-slate-600">
                    <h3 className="text-lg font-medium flex items-center mb-3 text-white">
                      <ExternalLink className="h-5 w-5 mr-2 text-indigo-400" />
                      Zoom / Google Meet
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Utilice plataformas familiares de videoconferencia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Mayor estabilidad en conexiones de baja velocidad</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Compartir pantalla y grabación nativa</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Fácil participación para clientes sin experiencia técnica</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Funciona bien en todos los dispositivos y navegadores</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-slate-600 bg-black/30">
                    <img 
                      src="/assets/ron-external-preview.jpg" 
                      alt="Vista previa de Zoom/Meet" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/500x300/384766/FFFFFF?text=Zoom+/+Meet';
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-slate-700 pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/ron-platform")}
              className="border-slate-600 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleContinue} className="bg-indigo-600 hover:bg-indigo-700">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}