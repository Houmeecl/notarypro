import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { QuizQuestion, Quiz as QuizType } from "@shared/schema";

interface QuizProps {
  quiz: QuizType;
  onClose: () => void;
  onComplete?: () => void;
}

export default function Quiz({ quiz, onClose, onComplete }: QuizProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch quiz questions
  const { data: questions, isLoading } = useQuery<QuizQuestion[]>({
    queryKey: [`/api/quizzes/${quiz.id}/questions`],
    enabled: !!quiz.id,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: { score: number, passed: boolean }) => {
      const res = await apiRequest("POST", `/api/quizzes/${quiz.id}/attempts`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: score >= quiz.passingScore ? "¡Quiz aprobado!" : "Quiz no aprobado",
        description: score >= quiz.passingScore 
          ? "Has superado el quiz exitosamente" 
          : "No has alcanzado el puntaje mínimo requerido",
        variant: score >= quiz.passingScore ? "default" : "destructive",
      });
      
      if (score >= quiz.passingScore && onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Error al enviar el quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;
    
    setIsSubmitting(true);
    
    // Calculate score
    let correctAnswers = 0;
    
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = finalScore >= quiz.passingScore;
    
    setScore(finalScore);
    setQuizCompleted(true);
    
    // Submit attempt to the server
    submitQuizMutation.mutate({
      score: finalScore,
      passed
    });
    
    setIsSubmitting(false);
  };

  // Convert options from JSON string to array
  const getOptions = (optionsStr: string): string[] => {
    try {
      return JSON.parse(optionsStr);
    } catch (error) {
      console.error("Error parsing options:", error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>No hay preguntas disponibles para este quiz</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onClose} variant="outline">Volver</Button>
        </CardFooter>
      </Card>
    );
  }

  // Quiz results view
  if (quizCompleted) {
    const isPassed = score >= quiz.passingScore;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultados del Quiz</CardTitle>
          <CardDescription>
            {isPassed 
              ? "¡Felicidades! Has completado el quiz exitosamente" 
              : "Has completado el quiz, pero no has alcanzado el puntaje mínimo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-6 rounded-lg ${isPassed ? "bg-green-50" : "bg-red-50"} mb-6 text-center`}>
            <div className="inline-flex justify-center items-center rounded-full w-16 h-16 mb-4 text-white bg-white">
              {isPassed ? (
                <CheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
            <h3 className={`text-xl font-bold ${isPassed ? "text-green-700" : "text-red-700"} mb-2`}>
              {isPassed ? "Quiz Aprobado" : "Quiz No Aprobado"}
            </h3>
            <p className={isPassed ? "text-green-600" : "text-red-600"}>
              Tu puntuación: {score}% (Mínimo requerido: {quiz.passingScore}%)
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resumen de respuestas</h3>
            
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="p-3 border rounded-md">
                  <div className="flex items-start gap-2">
                    <div className="min-w-5 mt-0.5">
                      {selectedAnswers[question.id] === question.correctAnswerIndex ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        Pregunta {index + 1}: {question.question}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Respuesta correcta: {getOptions(question.options)[question.correctAnswerIndex]}
                      </p>
                      {selectedAnswers[question.id] !== question.correctAnswerIndex && (
                        <p className="text-sm text-red-500 mt-1">
                          Tu respuesta: {getOptions(question.options)[selectedAnswers[question.id]]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={onClose} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al curso
          </Button>
          
          {!isPassed && (
            <Button onClick={() => {
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
            }}>
              Reintentar Quiz
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Quiz questions view
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-orange-500 mr-2" />
            <CardTitle>{quiz.title}</CardTitle>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Tiempo estimado: 10 minutos</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <CardDescription>
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </CardDescription>
            <CardDescription>
              Puntaje mínimo: {quiz.passingScore}%
            </CardDescription>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        {currentQuestion && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
              
              <RadioGroup
                value={selectedAnswers[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
              >
                <div className="space-y-3">
                  {getOptions(currentQuestion.options).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer py-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            
            {!selectedAnswers[currentQuestion.id] && currentQuestionIndex === totalQuestions - 1 && (
              <div className="flex items-center p-3 rounded-md bg-yellow-50 border border-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Debes seleccionar una respuesta antes de enviar el quiz.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button 
            onClick={handleSubmit}
            disabled={!Object.keys(selectedAnswers).length || Object.keys(selectedAnswers).length < totalQuestions || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar respuestas"
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion?.id] === undefined}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
