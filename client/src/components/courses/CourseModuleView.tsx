import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  File, 
  Lock, 
  Play, 
  Video,
  PlayCircle,
  FileText,
  Check,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";

interface CourseModuleViewProps {
  moduleId: string;
  moduleName: string;
  isUnlocked: boolean;
  isCompleted?: boolean;
  onModuleComplete?: () => void;
  onBack?: () => void;
  onNext?: () => void;
}

interface ModuleContent {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  isCompleted: boolean;
}

const CourseModuleView: React.FC<CourseModuleViewProps> = ({
  moduleId,
  moduleName,
  isUnlocked,
  isCompleted = false,
  onModuleComplete,
  onBack,
  onNext
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(isCompleted ? 100 : 0);
  
  // Datos de ejemplo para el módulo
  const moduleContents: ModuleContent[] = [
    { 
      id: `${moduleId}-1`, 
      title: 'Introducción al módulo', 
      type: 'video', 
      duration: '5:30', 
      isCompleted: progress >= 20 
    },
    { 
      id: `${moduleId}-2`, 
      title: 'Marco legal aplicable', 
      type: 'text', 
      duration: '10 min lectura', 
      isCompleted: progress >= 40 
    },
    { 
      id: `${moduleId}-3`, 
      title: 'Video explicativo: Aplicación práctica', 
      type: 'video', 
      duration: '12:45', 
      isCompleted: progress >= 60 
    },
    { 
      id: `${moduleId}-4`, 
      title: 'Material complementario', 
      type: 'text', 
      duration: '15 min lectura', 
      isCompleted: progress >= 80 
    },
    { 
      id: `${moduleId}-5`, 
      title: 'Evaluación del módulo', 
      type: 'quiz', 
      duration: '10 preguntas', 
      isCompleted: progress >= 100 
    },
  ];

  // Texto de ejemplo para contenido de tipo texto
  const textContent = `
    <h2>Marco Legal Aplicable en Chile</h2>
    
    <p>La certificación y firma electrónica en Chile está regulada principalmente por la Ley 19.799 sobre documentos electrónicos, firma electrónica y servicios de certificación.</p>
    
    <h3>Principales disposiciones</h3>
    
    <p>Esta ley establece que los documentos electrónicos que tengan firma electrónica serán válidos de la misma manera y producirán los mismos efectos que los documentos escritos. Además, reconoce dos tipos de firma electrónica:</p>
    
    <ul>
      <li><strong>Firma Electrónica Simple:</strong> cualquier sonido, símbolo o proceso electrónico que permite al receptor de un documento electrónico identificar al menos formalmente a su autor.</li>
      <li><strong>Firma Electrónica Avanzada:</strong> certificada por un prestador acreditado, creada usando medios que el titular mantiene bajo su exclusivo control.</li>
    </ul>
    
    <p>El Reglamento de la Ley 19.799, establecido por el Decreto Supremo N° 181, detalla los procedimientos para:</p>
    
    <ul>
      <li>Acreditación de prestadores de servicios de certificación</li>
      <li>Requisitos técnicos para las firmas electrónicas</li>
      <li>Procedimientos de certificación</li>
      <li>Obligaciones de los prestadores de servicios</li>
    </ul>
    
    <h3>La Entidad Acreditadora</h3>
    
    <p>En Chile, la entidad responsable de acreditar a los prestadores de servicios de certificación es la Subsecretaría de Economía y Empresas de Menor Tamaño. Esta entidad verifica el cumplimiento de las normas técnicas y legales para asegurar la confiabilidad de los certificados digitales.</p>
    
    <h3>Valor probatorio</h3>
    
    <p>En cuanto al valor probatorio, los documentos electrónicos firmados electrónicamente tienen la misma validez legal que los documentos en papel, siempre que la firma electrónica haya sido creada durante la vigencia del certificado respectivo y se pueda verificar su autenticidad.</p>
    
    <blockquote>
      <p>"Los documentos electrónicos podrán presentarse en juicio y tendrán valor probatorio"</p>
      <footer>- Artículo 5, Ley 19.799</footer>
    </blockquote>
    
    <p>Para el ejercicio profesional como certificador, es fundamental comprender estos aspectos legales que serán la base de su trabajo diario.</p>
  `;

  // Manejadores de eventos
  const handleCompleteContent = (contentId: string) => {
    // Aquí normalmente habría una llamada a la API para marcar como completado
    const contentIndex = moduleContents.findIndex(content => content.id === contentId);
    if (contentIndex !== -1) {
      const newProgress = Math.min(100, Math.round(((contentIndex + 1) / moduleContents.length) * 100));
      setProgress(newProgress);
      
      // Si es el último contenido del módulo, permitir completar el módulo
      if (contentIndex === moduleContents.length - 1) {
        onModuleComplete?.();
      }
    }
  };

  const handleSelectContent = (contentId: string) => {
    setSelectedContent(contentId);
    setActiveTab('content');
  };

  // Obtener el contenido seleccionado
  const activeContent = selectedContent ? 
    moduleContents.find(content => content.id === selectedContent) : 
    null;

  return (
    <div className="w-full space-y-6">
      {/* Encabezado del módulo */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{moduleName}</h2>
        
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Completado
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              En progreso
            </Badge>
          )}
        </div>
      </div>
      
      {/* Barra de progreso */}
      {isUnlocked && !isCompleted && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Progreso del módulo</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar con lista de contenidos */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contenidos del módulo</CardTitle>
              {!isUnlocked && (
                <CardDescription>
                  <div className="flex items-center text-amber-600">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Complete el módulo anterior para desbloquear</span>
                  </div>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-0.5">
                  {moduleContents.map((content) => (
                    <div 
                      key={content.id}
                      onClick={() => isUnlocked && handleSelectContent(content.id)}
                      className={`p-3 flex items-center justify-between hover:bg-gray-50 border-l-2 ${
                        selectedContent === content.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent'
                      } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center">
                        {content.type === 'video' ? (
                          <Play className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        ) : content.type === 'text' ? (
                          <File className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">{content.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {content.isCompleted && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-xs text-gray-500">{content.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Área principal de contenido */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Vista general</TabsTrigger>
                  <TabsTrigger 
                    value="content" 
                    disabled={!activeContent || !isUnlocked}
                  >
                    Contenido actual
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto">
              <TabsContent value="overview" className="mt-0 h-full">
                <div className="space-y-6">
                  <div className="aspect-video rounded-md overflow-hidden">
                    <ExplanatoryVideo
                      title={`Presentación del módulo: ${moduleName}`}
                      description="Este video presenta los objetivos de aprendizaje y contenidos del módulo"
                      videoType="tutorial"
                      triggerLabel="Ver presentación del módulo"
                    >
                      <div className="w-full h-full flex items-center justify-center cursor-pointer relative group">
                        <img 
                          src="https://images.unsplash.com/photo-1576267423048-15c0030e172b?q=80&w=1000&auto=format&fit=crop" 
                          alt="Presentación del módulo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-white rounded-full p-3">
                            <PlayCircle className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                      </div>
                    </ExplanatoryVideo>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Acerca de este módulo</h3>
                    <p className="text-gray-700">
                      Este módulo cubre los aspectos fundamentales relacionados con {moduleName}. 
                      Al completarlo, tendrá un entendimiento sólido de los conceptos clave y su aplicación práctica
                      en el contexto de la certificación profesional en Chile.
                    </p>
                    
                    <h3 className="text-lg font-medium">Objetivos de aprendizaje</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Comprender el marco legal aplicable a la certificación electrónica en Chile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Identificar los tipos de firmas electrónicas reconocidas en la legislación</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Aplicar correctamente los procedimientos de verificación documental</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Evaluar la validez legal de los documentos electrónicos</span>
                      </li>
                    </ul>
                    
                    <h3 className="text-lg font-medium">Contenido del módulo</h3>
                    <div className="space-y-2">
                      {moduleContents.map((content) => (
                        <div key={content.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            {content.type === 'video' ? (
                              <Video className="h-4 w-4 text-primary mr-2" />
                            ) : content.type === 'text' ? (
                              <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-orange-500 mr-2" />
                            )}
                            <span>{content.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{content.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="mt-0 h-full">
                {activeContent ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">{activeContent.title}</h3>
                      <Badge variant="outline" className={
                        activeContent.type === 'video' 
                          ? 'bg-primary/10 text-primary' 
                          : activeContent.type === 'text'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                      }>
                        {activeContent.type === 'video' 
                          ? 'Video' 
                          : activeContent.type === 'text'
                            ? 'Lectura'
                            : 'Evaluación'
                        }
                      </Badge>
                    </div>
                    
                    {activeContent.type === 'video' ? (
                      <div className="aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
                        <div className="text-white">
                          <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-70" />
                          <p className="text-center">El video se está cargando...</p>
                        </div>
                      </div>
                    ) : activeContent.type === 'text' ? (
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: textContent }} />
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-6 text-center">
                        <BookOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-orange-800 mb-2">
                          Evaluación del módulo
                        </h3>
                        <p className="text-orange-700 mb-6">
                          Esta evaluación consta de 10 preguntas sobre los temas tratados en el módulo.
                          Deberá obtener al menos un 70% para aprobar.
                        </p>
                        <Button 
                          onClick={() => handleCompleteContent(activeContent.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Comenzar evaluación
                        </Button>
                      </div>
                    )}
                    
                    {(activeContent.type === 'video' || activeContent.type === 'text') && (
                      <div className="text-center pt-4">
                        <Button 
                          onClick={() => handleCompleteContent(activeContent.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Marcar como completado
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const currentIndex = moduleContents.findIndex(c => c.id === activeContent.id);
                          if (currentIndex > 0) {
                            handleSelectContent(moduleContents[currentIndex - 1].id);
                          } else {
                            setActiveTab('overview');
                          }
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const currentIndex = moduleContents.findIndex(c => c.id === activeContent.id);
                          if (currentIndex < moduleContents.length - 1) {
                            handleSelectContent(moduleContents[currentIndex + 1].id);
                          }
                        }}
                        disabled={moduleContents.findIndex(c => c.id === activeContent.id) === moduleContents.length - 1}
                      >
                        Siguiente
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Ningún contenido seleccionado
                      </h3>
                      <p className="text-gray-500">
                        Seleccione un elemento del módulo para ver su contenido.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Controles de navegación entre módulos */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={!onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Módulo anterior
        </Button>
        
        {isCompleted ? (
          <Button 
            variant="default"
            onClick={onNext}
            disabled={!onNext}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Módulo completado
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={onNext}
            disabled={!onNext}
          >
            Siguiente módulo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseModuleView;