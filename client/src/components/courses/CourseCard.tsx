import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Clock, 
  BookOpen, 
  Users, 
  PlayCircle, 
  ChevronRight 
} from "lucide-react";
import { Link } from "wouter";
import { Course, CourseEnrollment } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: Course;
  enrollment?: CourseEnrollment;
  showEnrollButton?: boolean;
}

export default function CourseCard({ course, enrollment, showEnrollButton = true }: CourseCardProps) {
  const { toast } = useToast();

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${course.id}/enroll`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      toast({
        title: "Inscripción exitosa",
        description: `Te has inscrito en el curso "${course.title}"`,
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

  // Determine enrollment status for UI
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.completed || false;

  // Format price from cents to dollar display
  const formatPrice = (price: number) => {
    const dollars = price / 100;
    return `$${dollars.toFixed(2)}`;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden">
          {/* Course image */}
          <img
            src={course.imageUrl || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Price badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-primary/90 hover:bg-primary">
              {formatPrice(course.price)}
            </Badge>
          </div>
          
          {/* Status overlay for enrolled/completed */}
          {isEnrolled && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <Badge variant="outline" className={isCompleted 
                ? "bg-green-500/90 border-green-400 text-white" 
                : "bg-blue-500/90 border-blue-400 text-white"
              }>
                {isCompleted ? "Completado" : "En progreso"}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-5">
        <div className="mb-2 flex items-center">
          <GraduationCap className="h-4 w-4 text-primary mr-1.5" />
          <span className="text-sm text-gray-500">Curso de certificación</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span>4 semanas</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span>12 lecciones</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span>856 estudiantes</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <PlayCircle className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span>8 horas</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-4 border-t bg-gray-50">
        {isEnrolled ? (
          <Link href={`/courses/${course.id}`} className="w-full">
            <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
              {isCompleted ? "Ver certificado" : "Continuar curso"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        ) : showEnrollButton ? (
          <Button 
            variant="default" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={enrollMutation.isPending}
            onClick={() => enrollMutation.mutate()}
          >
            {enrollMutation.isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                Inscribirse al curso
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Link href={`/courses/${course.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              Ver detalles
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
