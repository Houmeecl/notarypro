import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/Sidebar";
import CourseContent from "@/components/courses/CourseContent";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  GraduationCap, 
  Clock, 
  BookOpen, 
  Users, 
  PlayCircle, 
  ChevronRight,
  CheckCircle,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Course, CourseEnrollment } from "@shared/schema";

export default function CoursePage() {
  const { user } = useAuth();
  const { id } = useParams();
  const courseId = parseInt(id);
  const { toast } = useToast();

  // Fetch course details
  const { data: course, isLoading: isCourseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !isNaN(courseId),
  });

  // Fetch user enrollments to check if enrolled
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/user/enrollments"],
    enabled: !!user,
  });

  // Determine if user is enrolled in this course
  const courseEnrollment = enrollments?.find(e => e.courseId === courseId);
  const isEnrolled = !!courseEnrollment;
  const isCompleted = courseEnrollment?.completed || false;

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      toast({
        title: "Inscripción exitosa",
        description: `Te has inscrito en el curso "${course?.title}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al inscribirse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark course as completed mutation
  const completeCoursesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/courses/${courseId}/enrollments/${courseEnrollment?.id}`, {
        completed: true,
        completedAt: new Date()
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      toast({
        title: "Curso completado",
        description: "¡Felicidades! Has completado el curso con éxito.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al completar el curso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCourseComplete = () => {
    if (courseEnrollment?.id) {
      completeCoursesMutation.mutate();
    }
  };

  // Format price from cents to dollar display
  const formatPrice = (price?: number) => {
    if (!price) return "$0.00";
    const dollars = price / 100;
    return `$${dollars.toFixed(2)}`;
  };

  // Loading state
  const isLoading = isCourseLoading || isEnrollmentsLoading;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/user-dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </Link>
              
              <div className="text-sm text-gray-500">
                {isEnrolled ? (
                  <Badge 
                    variant="outline" 
                    className={isCompleted 
                      ? "bg-green-100 border-green-200 text-green-800" 
                      : "bg-blue-100 border-blue-200 text-blue-800"
                    }
                  >
                    {isCompleted ? "Completado" : "Inscrito"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100">
                    No inscrito
                  </Badge>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded-md w-1/3"></div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
            )}
          </header>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : course ? (
            <>
              {/* Course Header Card */}
              <Card className="mb-8">
                <div className="md:flex">
                  <div className="w-full md:w-1/3 h-48 md:h-auto">
                    <img 
                      src={course.imageUrl || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 flex-1">
                    <div className="flex items-center mb-3">
                      <GraduationCap className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm text-gray-600">Curso de certificación</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h2>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">4 semanas</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">12 lecciones</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">856 estudiantes</span>
                      </div>
                      <div className="flex items-center">
                        <PlayCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">8 horas</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">{formatPrice(course.price)}</div>
                      
                      {!isEnrolled ? (
                        <Button 
                          className="bg-primary hover:bg-primary/90"
                          disabled={enrollMutation.isPending}
                          onClick={() => enrollMutation.mutate()}
                        >
                          {enrollMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              Inscribirse al curso
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      ) : isCompleted ? (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ver certificado
                        </Button>
                      ) : (
                        <Button variant="outline">
                          Continuar curso
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Course Content */}
              <CourseContent 
                courseId={courseId} 
                isEnrolled={isEnrolled}
                isCompleted={isCompleted}
                onComplete={handleCourseComplete}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="text-red-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">Curso no encontrado</h3>
                <p className="text-gray-500 mb-4">El curso que buscas no existe o ha sido eliminado.</p>
                <Link href="/user-dashboard">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
