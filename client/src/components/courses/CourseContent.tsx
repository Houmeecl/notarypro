import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  File, 
  CheckCircle, 
  Clock, 
  Lock, 
  Award, 
  Loader2,
  BookOpen
} from "lucide-react";
import { Course, CourseModule, CourseContent as ContentType, Quiz as QuizType } from "@shared/schema";
import QuizComponent from "./Quiz";

interface CourseContentProps {
  courseId: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  onComplete?: () => void;
}

export default function CourseContent({ courseId, isEnrolled, isCompleted, onComplete }: CourseContentProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<ContentType | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [completedContents, setCompletedContents] = useState<Set<number>>(new Set());

  // Fetch course details
  const { data: course, isLoading: isCourseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch modules
  const { data: modules, isLoading: isModulesLoading } = useQuery<CourseModule[]>({
    queryKey: [`/api/courses/${courseId}/modules`],
    enabled: !!courseId,
  });

  // State for storing module content
  const [moduleContents, setModuleContents] = useState<Record<number, ContentType[]>>({});
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<number, QuizType[]>>({});

  // Fetch module content when module is opened
  const handleModuleOpen = async (moduleId: string) => {
    setActiveModule(moduleId);
    const id = parseInt(moduleId);
    
    // If we already have the content, no need to fetch again
    if (moduleContents[id]) return;
    
    try {
      // Fetch contents
      const contentsResponse = await fetch(`/api/modules/${id}/contents`);
      if (contentsResponse.ok) {
        const contents = await contentsResponse.json();
        setModuleContents(prev => ({ ...prev, [id]: contents }));
      }
      
      // Fetch quizzes
      const quizzesResponse = await fetch(`/api/modules/${id}/quizzes`);
      if (quizzesResponse.ok) {
        const quizzes = await quizzesResponse.json();
        setModuleQuizzes(prev => ({ ...prev, [id]: quizzes }));
      }
    } catch (error) {
      console.error("Error fetching module content:", error);
    }
  };

  const handleContentClick = (content: ContentType) => {
    if (!isEnrolled) return;
    setActiveContent(content);
    setActiveQuiz(null);
    
    // Mark content as completed
    setCompletedContents(prev => new Set([...prev, content.id]));
  };

  const handleQuizClick = (quiz: QuizType) => {
    if (!isEnrolled) return;
    setActiveQuiz(quiz);
    setActiveContent(null);
  };

  const handleCloseContent = () => {
    setActiveContent(null);
    setActiveQuiz(null);
  };

  const calculateProgress = () => {
    if (!modules) return 0;
    
    let totalContents = 0;
    let completedCount = 0;
    
    // Count all contents and quizzes
    modules.forEach(module => {
      const contents = moduleContents[module.id] || [];
      const quizzes = moduleQuizzes[module.id] || [];
      
      totalContents += contents.length + quizzes.length;
      
      // Count completed contents
      contents.forEach(content => {
        if (completedContents.has(content.id)) {
          completedCount++;
        }
      });
      
      // Add quiz completions if needed
      // This would require tracking quiz completions as well
    });
    
    if (totalContents === 0) return 0;
    return Math.round((completedCount / totalContents) * 100);
  };

  const isLoading = isCourseLoading || isModulesLoading;

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !course ? (
        <div className="text-center py-10">
          <p className="text-red-500">No se pudo cargar el contenido del curso</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - course modules */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contenido del curso</CardTitle>
                {isEnrolled && !isCompleted && (
                  <CardDescription>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Tu progreso</span>
                        <span>{calculateProgress()}%</span>
                      </div>
                      <Progress value={calculateProgress()} className="h-2" />
                    </div>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {modules && modules.length > 0 ? (
                  <Accordion
                    type="single"
                    collapsible
                    value={activeModule || undefined}
                    onValueChange={(value) => value && handleModuleOpen(value)}
                  >
                    {modules.map((module) => (
                      <AccordionItem 
                        key={module.id} 
                        value={module.id.toString()}
                        className="border-0 border-b"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3 text-left">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs flex-shrink-0 mt-0.5">
                              {module.order}
                            </div>
                            <div>
                              <div className="font-medium text-base">{module.title}</div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>45 minutos</span>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <div className="space-y-1 pb-2">
                            {/* Module contents */}
                            {moduleContents[module.id]?.map((content) => (
                              <div 
                                key={content.id} 
                                className={`pl-12 pr-4 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${!isEnrolled ? "opacity-70" : ""}`}
                                onClick={() => handleContentClick(content)}
                              >
                                <div className="flex items-center">
                                  {content.contentType === "video" ? (
                                    <Play className="h-4 w-4 text-primary mr-2" />
                                  ) : (
                                    <File className="h-4 w-4 text-primary mr-2" />
                                  )}
                                  <span className="text-sm">{content.title}</span>
                                </div>
                                
                                <div>
                                  {!isEnrolled ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : completedContents.has(content.id) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <div className="text-xs text-gray-500">5 min</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {/* Module quizzes */}
                            {moduleQuizzes[module.id]?.map((quiz) => (
                              <div 
                                key={quiz.id} 
                                className={`pl-12 pr-4 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${!isEnrolled ? "opacity-70" : ""}`}
                                onClick={() => handleQuizClick(quiz)}
                              >
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 text-orange-500 mr-2" />
                                  <span className="text-sm">{quiz.title}</span>
                                </div>
                                
                                <div>
                                  {!isEnrolled ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Quiz
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No hay módulos disponibles para este curso.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right content area */}
          <div className="md:col-span-2">
            {!activeContent && !activeQuiz ? (
              <Card>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>
                    {isCompleted ? 
                      "Has completado este curso. ¡Felicidades!" : 
                      "Selecciona un contenido del curso para comenzar."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-gray-100 flex flex-col items-center justify-center mb-4">
                    <Award className="h-16 w-16 text-primary/40 mb-2" />
                    <h3 className="text-lg font-medium text-gray-700">
                      {isCompleted ? "¡Curso completado!" : "Bienvenido al curso"}
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mt-2">
                      {isCompleted
                        ? "Has completado todos los módulos y evaluaciones del curso. Ya puedes acceder a tu certificado."
                        : "Explora los módulos en el panel izquierdo para comenzar a aprender."}
                    </p>
                  </div>
                  
                  <div className="prose max-w-none">
                    <h3>Descripción del curso</h3>
                    <p>{course.description}</p>
                    
                    <h3>Lo que aprenderás</h3>
                    <ul>
                      <li>Fundamentos de la certificación digital</li>
                      <li>Marco legal y normativo de la firma electrónica</li>
                      <li>Proceso de validación de identidad</li>
                      <li>Certificación de documentos electrónicos</li>
                      <li>Uso de la plataforma de certificación</li>
                    </ul>
                  </div>
                  
                  {isCompleted && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                      <Award className="h-10 w-10 text-green-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-green-800 mb-1">
                        Certificado disponible
                      </h3>
                      <p className="text-green-700 text-sm mb-3">
                        Has completado el curso con éxito y ya puedes descargar tu certificado.
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Descargar certificado
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : activeContent ? (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{activeContent.title}</CardTitle>
                    <CardDescription>
                      {activeContent.contentType === "video" ? "Video" : "Material de lectura"}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseContent}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </CardHeader>
                <CardContent>
                  {activeContent.contentType === "video" ? (
                    <div className="aspect-video bg-black rounded-md flex items-center justify-center mb-4">
                      <Play className="h-12 w-12 text-white opacity-70" />
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: activeContent.content }} />
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline">
                      Contenido anterior
                    </Button>
                    <Button variant="default" className="bg-primary hover:bg-primary/90">
                      Siguiente contenido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : activeQuiz ? (
              <QuizComponent quiz={activeQuiz} onClose={handleCloseContent} onComplete={onComplete} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
